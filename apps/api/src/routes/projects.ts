import { Router } from "express"
import { eq, and } from "drizzle-orm"
import { db, projects, projectMembers } from "../db"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"
import { createProjectSchema, updateProjectSchema } from "@gutenberg/shared"

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

export default router
