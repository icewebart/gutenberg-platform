import { Router } from "express"
import { eq } from "drizzle-orm"
import { db, organizations, netzwerkCities } from "../db"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"

const router = Router()

function generateDomain(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${slug}-${suffix}`
}

// GET /organizations
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const orgs = await db.query.organizations.findMany()
    res.json(orgs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /organizations/:id
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, req.params.id),
    })
    if (!org) {
      res.status(404).json({ error: "Organization not found" })
      return
    }
    res.json(org)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /organizations/:id/cities
router.get("/:id/cities", requireAuth, async (req: AuthRequest, res) => {
  try {
    const cities = await db.query.netzwerkCities.findMany({
      where: eq(netzwerkCities.organizationId, req.params.id),
    })
    res.json(cities)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PATCH /organizations/:id (admin only)
router.patch("/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { name, type, settings } = req.body
    const [updated] = await db
      .update(organizations)
      .set({
        ...(name ? { name } : {}),
        ...(type ? { type } : {}),
        ...(settings !== undefined ? { settings } : {}),
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, req.params.id))
      .returning()
    if (!updated) {
      res.status(404).json({ error: "Organization not found" })
      return
    }
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /organizations/:id (admin only)
router.delete("/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    await db.delete(organizations).where(eq(organizations.id, req.params.id))
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /organizations (admin only)
router.post("/", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { name, type, settings } = req.body
    if (!name) {
      res.status(400).json({ error: "name is required" })
      return
    }
    const [org] = await db.insert(organizations).values({
      name,
      domain: generateDomain(name),
      type: type ?? "student_organization",
      settings,
    }).returning()
    res.status(201).json(org)
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Domain already in use" })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /organizations/:id/cities
router.post("/:id/cities", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    const { name, country } = req.body
    if (!name || !country) {
      res.status(400).json({ error: "name and country are required" })
      return
    }
    const [city] = await db
      .insert(netzwerkCities)
      .values({ name, country, organizationId: req.params.id })
      .returning()
    res.status(201).json(city)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
