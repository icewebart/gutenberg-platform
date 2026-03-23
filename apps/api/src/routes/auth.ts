import { Router } from "express"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db, users, organizations } from "../db"
import { signToken } from "../lib/jwt"
import { loginSchema, registerSchema } from "@gutenberg/shared"
import { requireAuth, type AuthRequest } from "../middleware/auth"

const router = Router()

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await db.query.users.findFirst({ where: eq(users.email, email) })
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is inactive" })
      return
    }

    // Update last login
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id))

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role as any })

    const { passwordHash: _, ...safeUser } = user
    res.json({ user: safeUser, token })
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)

    const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) })
    if (existing) {
      res.status(409).json({ error: "Email already in use" })
      return
    }

    // Auto-assign to first org if not provided
    let orgId = data.organizationId
    if (!orgId) {
      const defaultOrg = await db.query.organizations.findFirst()
      if (!defaultOrg) {
        res.status(500).json({ error: "No organization found" })
        return
      }
      orgId = defaultOrg.id
    }

    const hash = await bcrypt.hash(data.password, 12)
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: hash,
        name: data.name,
        role: data.role ?? "volunteer",
        organizationId: orgId,
        netzwerkCityId: data.netzwerkCityId,
        department: "None",
        permissions: [],
        isActive: true,
        isVerified: false,
      })
      .returning()

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role as any })
    const { passwordHash: _, ...safeUser } = user
    res.status(201).json({ user: safeUser, token })
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /auth/me
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.id) })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }
    const { passwordHash: _, ...safeUser } = user
    res.json(safeUser)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
