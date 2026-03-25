import { Router } from "express"
import { eq, and } from "drizzle-orm"
import { db, projects, projectMembers, projectApplications, users } from "../db"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"
import { createProjectSchema, updateProjectSchema } from "@gutenberg/shared"
import Stripe from "stripe"
import bcrypt from "bcryptjs"

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
  return new Stripe(key, { apiVersion: "2024-11-20.acacia" as any })
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

const router = Router()

// GET /projects?organizationId=
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organizationId } = req.query as { organizationId?: string }

    const allProjects = await db.query.projects.findMany({
      where: organizationId ? eq(projects.organizationId, organizationId) : undefined,
    })
    res.json(allProjects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /projects/:id
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, req.params.id),
    })
    if (!project) {
      res.status(404).json({ error: "Project not found" })
      return
    }

    const members = await db.query.projectMembers.findMany({
      where: eq(projectMembers.projectId, req.params.id),
    })

    res.json({ ...project, members })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /projects
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = createProjectSchema.parse(req.body)
    const { memberIds, ...projectData } = data

    const [project] = await db
      .insert(projects)
      .values({ ...projectData, createdBy: req.user!.id })
      .returning()

    // Add members
    if (memberIds?.length) {
      await db.insert(projectMembers).values(
        memberIds.map((userId) => ({ projectId: project.id, userId, role: "member" }))
      )
    }

    // Add creator as manager if not already in memberIds
    if (data.projectManagerId !== req.user!.id) {
      await db.insert(projectMembers).values({
        projectId: project.id,
        userId: req.user!.id,
        role: "manager",
      }).onConflictDoNothing()
    }

    res.status(201).json(project)
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PATCH /projects/:id
router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = updateProjectSchema.parse(req.body)
    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, req.params.id))
      .returning()

    if (!updated) {
      res.status(404).json({ error: "Project not found" })
      return
    }
    res.json(updated)
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /projects/:id
router.delete("/:id", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    await db.delete(projects).where(eq(projects.id, req.params.id))
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /projects/:id/join
router.post("/:id/join", requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, req.params.id),
    })
    if (!project) {
      res.status(404).json({ error: "Project not found" })
      return
    }

    const existing = await db.query.projectMembers.findFirst({
      where: and(
        eq(projectMembers.projectId, req.params.id),
        eq(projectMembers.userId, req.user!.id)
      ),
    })
    if (existing) {
      res.status(409).json({ error: "Already a member" })
      return
    }

    await db.insert(projectMembers).values({
      projectId: req.params.id,
      userId: req.user!.id,
      role: "participant",
    })

    await db
      .update(projects)
      .set({ currentParticipants: project.currentParticipants + 1, updatedAt: new Date() })
      .where(eq(projects.id, req.params.id))

    res.status(201).json({ message: "Joined project" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /projects/:id/leave
router.post("/:id/leave", requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, req.params.id),
    })
    if (!project) {
      res.status(404).json({ error: "Project not found" })
      return
    }

    await db.delete(projectMembers).where(
      and(
        eq(projectMembers.projectId, req.params.id),
        eq(projectMembers.userId, req.user!.id)
      )
    )

    const newCount = Math.max(0, project.currentParticipants - 1)
    await db
      .update(projects)
      .set({ currentParticipants: newCount, updatedAt: new Date() })
      .where(eq(projects.id, req.params.id))

    res.json({ message: "Left project" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /projects/:id/public — no auth required
router.get("/:id/public", async (req, res) => {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, req.params.id),
    })
    if (!project) {
      res.status(404).json({ error: "Project not found" })
      return
    }
    res.json({
      id: project.id,
      title: project.title,
      shortDescription: project.shortDescription,
      imageUrl: project.imageUrl,
      startDate: project.startDate,
      endDate: project.endDate,
      location: project.location,
      projectType: project.projectType,
      applicationFee: project.applicationFee,
      formFields: project.formFields,
      registrationEnabled: project.registrationEnabled,
      autoApprove: project.autoApprove,
      organizationId: project.organizationId,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /projects/:id/apply — no auth required
router.post("/:id/apply", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, formData } = req.body as {
      firstName: string
      lastName: string
      email: string
      phone?: string
      formData?: Record<string, unknown>
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, req.params.id),
    })
    if (!project) {
      res.status(404).json({ error: "Project not found" })
      return
    }
    if (!project.registrationEnabled) {
      res.status(400).json({ error: "Registration is not enabled for this project" })
      return
    }

    // Check duplicate email
    const existing = await db.query.projectApplications.findFirst({
      where: and(
        eq(projectApplications.projectId, req.params.id),
        eq(projectApplications.email, email)
      ),
    })
    if (existing) {
      res.status(409).json({ error: "You have already applied to this project" })
      return
    }

    if (project.applicationFee > 0) {
      // Paid flow — create pending application and Stripe Checkout
      const [application] = await db
        .insert(projectApplications)
        .values({
          projectId: req.params.id,
          email,
          firstName,
          lastName,
          phone: phone ?? null,
          formData: formData ?? {},
          paymentStatus: "pending",
          status: "pending",
        })
        .returning()

      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              unit_amount: project.applicationFee,
              product_data: { name: project.title },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.WEB_URL ?? "http://localhost:3000"}/apply/${req.params.id}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.WEB_URL ?? "http://localhost:3000"}/apply/${req.params.id}`,
        metadata: { applicationId: application.id, projectId: req.params.id },
      })

      await db
        .update(projectApplications)
        .set({ stripeSessionId: session.id })
        .where(eq(projectApplications.id, application.id))

      res.json({ checkoutUrl: session.url })
    } else {
      // Free flow — create user and application immediately
      const tempPassword = generateTempPassword()
      const passwordHash = await bcrypt.hash(tempPassword, 10)

      let existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (!existingUser) {
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            passwordHash,
            name: `${firstName} ${lastName}`.trim(),
            firstName,
            lastName,
            phone: phone ?? null,
            role: "participant",
            organizationId: project.organizationId,
          })
          .returning()
        existingUser = newUser
      }

      const appStatus = project.autoApprove ? "approved" : "pending"

      const [application] = await db
        .insert(projectApplications)
        .values({
          projectId: req.params.id,
          userId: existingUser.id,
          email,
          firstName,
          lastName,
          phone: phone ?? null,
          formData: formData ?? {},
          paymentStatus: "free",
          status: appStatus,
          tempPassword,
        })
        .returning()

      if (appStatus === "approved") {
        const existingMember = await db.query.projectMembers.findFirst({
          where: and(
            eq(projectMembers.projectId, req.params.id),
            eq(projectMembers.userId, existingUser.id)
          ),
        })
        if (!existingMember) {
          await db.insert(projectMembers).values({
            projectId: req.params.id,
            userId: existingUser.id,
            role: "participant",
          })
        }
      }

      res.json({ success: true, email, tempPassword, status: appStatus })
    }
  } catch (err: any) {
    console.error("[apply]", err)
    res.status(500).json({ error: err?.message ?? "Internal server error" })
  }
})

// GET /projects/:id/apply/confirm?session_id=xxx — no auth required
router.get("/:id/apply/confirm", async (req, res) => {
  try {
    const sessionId = req.query.session_id as string
    if (!sessionId) {
      res.status(400).json({ error: "session_id is required" })
      return
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId)

    const application = await db.query.projectApplications.findFirst({
      where: eq(projectApplications.stripeSessionId, sessionId),
    })

    if (!application) {
      res.status(404).json({ error: "Application not found" })
      return
    }

    if (session.payment_status === "paid" && application.paymentStatus !== "paid") {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, req.params.id),
      })

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
            organizationId: project!.organizationId,
          })
          .returning()
        existingUser = newUser
      }

      const appStatus = project?.autoApprove ? "approved" : "pending"

      await db
        .update(projectApplications)
        .set({
          paymentStatus: "paid",
          userId: existingUser.id,
          tempPassword,
          status: appStatus,
          stripePaymentIntentId: session.payment_intent as string | null ?? null,
        })
        .where(eq(projectApplications.id, application.id))

      if (appStatus === "approved") {
        const existingMember = await db.query.projectMembers.findFirst({
          where: and(
            eq(projectMembers.projectId, req.params.id),
            eq(projectMembers.userId, existingUser.id)
          ),
        })
        if (!existingMember) {
          await db.insert(projectMembers).values({
            projectId: req.params.id,
            userId: existingUser.id,
            role: "participant",
          })
        }
      }

      res.json({ success: true, email: application.email, tempPassword, status: appStatus, alreadyProcessed: false })
    } else if (application.paymentStatus === "paid") {
      res.json({ success: true, email: application.email, tempPassword: application.tempPassword, status: application.status, alreadyProcessed: true })
    } else {
      res.status(400).json({ error: "Payment not completed" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /projects/:id/applications — requireAuth admin/board_member
router.get("/:id/applications", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    const apps = await db.query.projectApplications.findMany({
      where: eq(projectApplications.projectId, req.params.id),
    })
    res.json(apps)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PATCH /projects/:id/applications/:appId — requireAuth admin/board_member
router.patch("/:id/applications/:appId", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body as { status: "approved" | "rejected" }
    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ error: "Invalid status" })
      return
    }

    const [updated] = await db
      .update(projectApplications)
      .set({ status })
      .where(and(
        eq(projectApplications.id, req.params.appId),
        eq(projectApplications.projectId, req.params.id)
      ))
      .returning()

    if (!updated) {
      res.status(404).json({ error: "Application not found" })
      return
    }

    if (status === "approved" && updated.userId) {
      const existingMember = await db.query.projectMembers.findFirst({
        where: and(
          eq(projectMembers.projectId, req.params.id),
          eq(projectMembers.userId, updated.userId)
        ),
      })
      if (!existingMember) {
        await db.insert(projectMembers).values({
          projectId: req.params.id,
          userId: updated.userId,
          role: "participant",
        })
      }
    }

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
