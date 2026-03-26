import { Router } from "express"
import bcrypt from "bcryptjs"
import { eq, and } from "drizzle-orm"
import { db, users } from "../db"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"
import { updateUserSchema, addPointsSchema } from "@gutenberg/shared"
import { v4 as uuidv4 } from "uuid"
import { createNotification } from "./notifications"

const router = Router()

// GET /users?organizationId=
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organizationId, role } = req.query as { organizationId?: string; role?: string }

    let allUsers = await db.query.users.findMany({
      where: organizationId ? eq(users.organizationId, organizationId) : undefined,
    })

    if (role) {
      allUsers = allUsers.filter((u) => u.role === role)
    }

    const safe = allUsers.map(({ passwordHash: _, ...u }) => u)
    res.json(safe)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /users/:id
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.params.id) })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }
    const { passwordHash: _, ...safe } = user
    res.json(safe)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PATCH /users/:id
router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Users can only update themselves unless admin
    if (req.user!.id !== req.params.id && req.user!.role !== "admin") {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const data = updateUserSchema.parse(req.body)
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, req.params.id))
      .returning()

    if (!updated) {
      res.status(404).json({ error: "User not found" })
      return
    }

    const { passwordHash: _, ...safe } = updated
    res.json(safe)
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /users/:id/points
router.post("/:id/points", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    const { points, reason, type } = addPointsSchema.parse(req.body)

    const user = await db.query.users.findFirst({ where: eq(users.id, req.params.id) })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    const gamification = (user.gamification as any) ?? { points: 0, level: 1, badges: [], achievements: [] }
    const pointsHistory = ((user as any).pointsHistory as any[]) ?? []

    const newPoints = type === "earned" ? gamification.points + points : gamification.points - points
    const newLevel = Math.floor(newPoints / 100) + 1

    const historyEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      reason,
      points,
      type,
    }

    const [updated] = await db
      .update(users)
      .set({
        gamification: { ...gamification, points: newPoints, level: newLevel },
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.params.id))
      .returning()

    const { passwordHash: _, ...safe } = updated
    res.json(safe)
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /users (admin: create user manually)
router.post("/", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { email, name, role, department, organizationId, netzwerkCityId, password } = req.body

    if (!email || !name || !organizationId) {
      res.status(400).json({ error: "email, name, and organizationId are required" })
      return
    }

    const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
    if (existing) {
      res.status(409).json({ error: "Email already in use" })
      return
    }

    const tempPassword = password || Math.random().toString(36).slice(-12)
    const hash = await bcrypt.hash(tempPassword, 12)

    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hash,
        name,
        role: role ?? "volunteer",
        department: department ?? "None",
        organizationId,
        netzwerkCityId: netzwerkCityId ?? null,
        permissions: [],
        isActive: true,
        isVerified: false,
      })
      .returning()

    const { passwordHash: _, ...safe } = user

    // Notify the new user
    createNotification({
      userId: user.id,
      organizationId,
      type: "member_joined",
      title: "Welcome to the platform! 👋",
      message: `Your account has been created. Welcome to the team!`,
      link: "/dashboard",
    })

    res.status(201).json({ ...safe, temporaryPassword: password ? undefined : tempPassword })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /users/:id
router.delete("/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    await db.delete(users).where(eq(users.id, req.params.id))
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
