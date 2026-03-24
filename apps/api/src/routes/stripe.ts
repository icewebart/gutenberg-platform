import { Router } from "express"
import Stripe from "stripe"
import { db, projectApplications, users, projectMembers, projects } from "../db"
import { eq, and } from "drizzle-orm"
import bcrypt from "bcryptjs"

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-11-20.acacia" as any })

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    )
  } catch (err: any) {
    res.status(400).json({ error: `Webhook error: ${err.message}` })
    return
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const { applicationId } = session.metadata ?? {}

    if (!applicationId) {
      res.json({ received: true })
      return
    }

    try {
      const application = await db.query.projectApplications.findFirst({
        where: eq(projectApplications.id, applicationId),
      })

      if (!application || application.paymentStatus === "paid") {
        res.json({ received: true })
        return
      }

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, application.projectId),
      })

      if (!project) {
        res.json({ received: true })
        return
      }

      const tempPassword = generateTempPassword()
      const passwordHash = await bcrypt.hash(tempPassword, 10)

      let existingUser = await db.query.users.findFirst({
        where: eq(users.email, application.email),
      })

      if (!existingUser) {
        const [newUser] = await db
          .insert(users)
          .values({
            email: application.email,
            passwordHash,
            name: `${application.firstName} ${application.lastName}`.trim(),
            firstName: application.firstName,
            lastName: application.lastName,
            phone: application.phone ?? null,
            role: "participant",
            organizationId: project.organizationId,
          })
          .returning()
        existingUser = newUser
      }

      const appStatus = project.autoApprove ? "approved" : "pending"

      await db
        .update(projectApplications)
        .set({
          paymentStatus: "paid",
          userId: existingUser.id,
          tempPassword,
          status: appStatus,
          stripePaymentIntentId: session.payment_intent as string | null ?? null,
        })
        .where(eq(projectApplications.id, applicationId))

      if (appStatus === "approved") {
        const existingMember = await db.query.projectMembers.findFirst({
          where: and(
            eq(projectMembers.projectId, application.projectId),
            eq(projectMembers.userId, existingUser.id)
          ),
        })
        if (!existingMember) {
          await db.insert(projectMembers).values({
            projectId: application.projectId,
            userId: existingUser.id,
            role: "participant",
          })
        }
      }
    } catch (err) {
      console.error("Webhook processing error:", err)
    }
  }

  res.json({ received: true })
})

export default router
