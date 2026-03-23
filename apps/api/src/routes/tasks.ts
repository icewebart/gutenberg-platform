import { Router } from "express"
import { eq, and } from "drizzle-orm"
import { db, tasks, users } from "../db"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"

const router = Router()

// GET /tasks?organizationId=&myTasks=true
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organizationId, myTasks } = req.query as {
      organizationId?: string
      myTasks?: string
    }

    let allTasks = await db.query.tasks.findMany({
      where: organizationId ? eq(tasks.organizationId, organizationId) : undefined,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })

    if (myTasks === "true" && req.user) {
      allTasks = allTasks.filter((t) => t.assignedTo === req.user!.id)
    }

    // Enrich with assignee and project info
    const enriched = await Promise.all(
      allTasks.map(async (task) => {
        let assignee = null
        if (task.assignedTo) {
          const u = await db.query.users.findFirst({ where: eq(users.id, task.assignedTo) })
          if (u) assignee = { id: u.id, name: u.name, avatar: u.avatar }
        }
        return { ...task, assignee }
      })
    )

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /tasks/:id
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const task = await db.query.tasks.findFirst({ where: eq(tasks.id, req.params.id) })
    if (!task) {
      res.status(404).json({ error: "Task not found" })
      return
    }
    res.json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /tasks (admin, board_member, volunteer)
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const role = req.user!.role
    if (role === "participant") {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const { organizationId, title, description, status, priority, deadline, points, assignedTo, projectId } = req.body

    if (!organizationId || !title) {
      res.status(400).json({ error: "organizationId and title are required" })
      return
    }

    const [task] = await db
      .insert(tasks)
      .values({
        organizationId,
        title,
        description: description ?? "",
        status: status ?? "todo",
        priority: priority ?? "medium",
        deadline: deadline ? new Date(deadline) : null,
        points: points ?? 0,
        assignedTo: assignedTo ?? null,
        createdBy: req.user!.id,
        projectId: projectId ?? null,
      })
      .returning()

    res.status(201).json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PATCH /tasks/:id
router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const role = req.user!.role
    if (role === "participant") {
      res.status(403).json({ error: "Forbidden" })
      return
    }

    const { title, description, status, priority, deadline, points, assignedTo, projectId } = req.body

    const [updated] = await db
      .update(tasks)
      .set({
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(deadline !== undefined ? { deadline: deadline ? new Date(deadline) : null } : {}),
        ...(points !== undefined ? { points } : {}),
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(projectId !== undefined ? { projectId } : {}),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, req.params.id))
      .returning()

    if (!updated) {
      res.status(404).json({ error: "Task not found" })
      return
    }

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PATCH /tasks/:id/complete — mark done and award points
router.patch("/:id/complete", requireAuth, async (req: AuthRequest, res) => {
  try {
    const task = await db.query.tasks.findFirst({ where: eq(tasks.id, req.params.id) })
    if (!task) {
      res.status(404).json({ error: "Task not found" })
      return
    }

    const now = new Date()
    const [updated] = await db
      .update(tasks)
      .set({ status: "done", completedAt: now, updatedAt: now })
      .where(eq(tasks.id, req.params.id))
      .returning()

    // Award points to assignee if not yet awarded
    if (task.assignedTo && task.points > 0 && !task.pointsAwarded) {
      const user = await db.query.users.findFirst({ where: eq(users.id, task.assignedTo) })
      if (user) {
        const gamification = (user.gamification as any) ?? { points: 0, level: 1, badges: [], achievements: [] }
        const newPoints = gamification.points + task.points
        const newLevel = Math.floor(newPoints / 100) + 1

        await db
          .update(users)
          .set({
            gamification: { ...gamification, points: newPoints, level: newLevel },
            updatedAt: now,
          })
          .where(eq(users.id, task.assignedTo))

        await db
          .update(tasks)
          .set({ pointsAwarded: true })
          .where(eq(tasks.id, req.params.id))

        updated.pointsAwarded = true
      }
    }

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /tasks/:id (admin, board_member)
router.delete("/:id", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    await db.delete(tasks).where(eq(tasks.id, req.params.id))
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
