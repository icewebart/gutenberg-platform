import { Router } from "express"
import { eq, and } from "drizzle-orm"
import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"
import { db, invitations, users, organizations } from "../db"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"
import { signToken } from "../lib/jwt"
import { sendInvitationEmail } from "../lib/email"

const router = Router()

// POST /invitations — admin/board_member creates an invitation
router.post("/", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    const { email, role, organizationId } = req.body as {
      email: string
      role: string
      organizationId: string
    }

    if (!email || !role || !organizationId) {
      res.status(400).json({ error: "email, role and organizationId are required" })
      return
    }

    // Check if user already exists
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
    if (existing) {
      res.status(409).json({ error: "A user with this email already exists" })
      return
    }

    // Check for pending invite
    const existingInvite = await db.query.invitations.findFirst({
      where: and(
        eq(invitations.email, email),
        eq(invitations.organizationId, organizationId)
      ),
    })
    if (existingInvite) {
      res.status(409).json({ error: "An invitation has already been sent to this email" })
      return
    }

    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    })
    if (!org) {
      res.status(404).json({ error: "Organization not found" })
      return
    }

    const inviter = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id),
    })

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const [invite] = await db
      .insert(invitations)
      .values({ email, role, organizationId, token, invitedBy: req.user!.id, expiresAt })
      .returning()

    // Send invitation email (non-blocking)
    const webUrl = process.env.WEB_URL ?? "http://localhost:3000"
    const inviterName = inviter
      ? (inviter.firstName && inviter.lastName
          ? `${inviter.firstName} ${inviter.lastName}`
          : inviter.name)
      : "Someone"

    sendInvitationEmail(email, inviterName, org.name, role, token, webUrl).catch(
      (err) => console.error("[email] Failed to send invitation email:", err)
    )

    res.status(201).json(invite)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /invitations — list invitations for an org (admin/board_member)
router.get("/", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    const { organizationId } = req.query as { organizationId?: string }
    const all = await db.query.invitations.findMany({
      where: organizationId ? eq(invitations.organizationId, organizationId) : undefined,
    })
    res.json(all)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /invitations/:token — public, get invite details for the accept page
router.get("/:token", async (req, res) => {
  try {
    const invite = await db.query.invitations.findFirst({
      where: eq(invitations.token, req.params.token),
    })

    if (!invite) {
      res.status(404).json({ error: "Invitation not found or already used" })
      return
    }

    if (invite.usedAt) {
      res.status(410).json({ error: "This invitation has already been used" })
      return
    }

    if (new Date() > invite.expiresAt) {
      res.status(410).json({ error: "This invitation has expired" })
      return
    }

    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, invite.organizationId),
    })

    res.json({
      email: invite.email,
      role: invite.role,
      organizationId: invite.organizationId,
      organizationName: org?.name ?? "Unknown Organization",
      expiresAt: invite.expiresAt,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /invitations/:token/accept — public, create account and accept invite
router.post("/:token/accept", async (req, res) => {
  try {
    const { name, password, firstName, lastName } = req.body as {
      name: string
      password: string
      firstName?: string
      lastName?: string
    }

    if (!name || !password) {
      res.status(400).json({ error: "name and password are required" })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" })
      return
    }

    const invite = await db.query.invitations.findFirst({
      where: eq(invitations.token, req.params.token),
    })

    if (!invite) {
      res.status(404).json({ error: "Invitation not found" })
      return
    }
    if (invite.usedAt) {
      res.status(410).json({ error: "This invitation has already been used" })
      return
    }
    if (new Date() > invite.expiresAt) {
      res.status(410).json({ error: "This invitation has expired" })
      return
    }

    const existing = await db.query.users.findFirst({ where: eq(users.email, invite.email) })
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" })
      return
    }

    const hash = await bcrypt.hash(password, 12)

    const [user] = await db
      .insert(users)
      .values({
        email: invite.email,
        passwordHash: hash,
        name,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        role: invite.role,
        organizationId: invite.organizationId,
        department: "None",
        permissions: [],
        isActive: true,
        isVerified: true, // invited users are pre-verified
      })
      .returning()

    // Mark invitation as used
    await db
      .update(invitations)
      .set({ usedAt: new Date() })
      .where(eq(invitations.id, invite.id))

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role as any })
    const { passwordHash: _, ...safeUser } = user
    res.status(201).json({ user: safeUser, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /invitations/:id — cancel an invitation
router.delete("/:id", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    await db.delete(invitations).where(eq(invitations.id, req.params.id))
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
