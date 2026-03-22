import { Router } from "express"
import { eq } from "drizzle-orm"
import { db, courses } from "../db"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"
import { createCourseSchema } from "@gutenberg/shared"

const router = Router()

// GET /courses?organizationId=
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organizationId } = req.query as { organizationId?: string }
    const all = await db.query.courses.findMany({
      where: organizationId ? eq(courses.organizationId, organizationId) : undefined,
    })
    res.json(all)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /courses/:id
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, req.params.id) })
    if (!course) {
      res.status(404).json({ error: "Course not found" })
      return
    }
    res.json(course)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /courses
router.post("/", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    const data = createCourseSchema.parse(req.body)
    const [course] = await db.insert(courses).values(data).returning()
    res.status(201).json(course)
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /courses/:id/enroll
router.post("/:id/enroll", requireAuth, async (req: AuthRequest, res) => {
  try {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, req.params.id) })
    if (!course) {
      res.status(404).json({ error: "Course not found" })
      return
    }
    const enrolled = (course.enrolledUsers as string[]) ?? []
    if (enrolled.includes(req.user!.id)) {
      res.status(409).json({ error: "Already enrolled" })
      return
    }
    const [updated] = await db
      .update(courses)
      .set({ enrolledUsers: [...enrolled, req.user!.id], updatedAt: new Date() })
      .where(eq(courses.id, req.params.id))
      .returning()
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
