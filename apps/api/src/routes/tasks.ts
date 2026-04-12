import { Router } from "express"
import { eq, and, asc } from "drizzle-orm"
import { db, tasks, users, taskComments } from "../db"
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth"

const router = Router()

// ─── Tasks ────────────────────────────────────────────────────────────────────

// GET /tasks?organizationId=&myTasks=true&projectId=
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organizationId, myTasks, projectId } = req.query as {
      organizationId?: string
      myTasks?: string
      projectId?: string
    }

    const conditions = []
    if (organizationId) conditions.push(eq(tasks.organizationId, organizationId))
    if (projectId) conditions.push(eq(tasks.projectId, projectId))

    let allTasks = await db.query.tasks.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })

    if (myTasks === "true" && req.user) {
      allTasks = allTasks.filter((t) => t.assignedTo === req.user!.id)
    }

    // Enrich with assignee info
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
    if (!task) { res.status(404).json({ error: "Task not found" }); return }
    res.json(task)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /tasks
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role === "participant") { res.status(403).json({ error: "Forbidden" }); return }

    const { organizationId, title, description, status, priority, deadline, points, assignedTo, projectId, labels, subtasks } = req.body

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
        labels: labels ?? [],
        subtasks: subtasks ?? [],
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
    if (req.user!.role === "participant") { res.status(403).json({ error: "Forbidden" }); return }

    const { title, description, status, priority, deadline, points, assignedTo, projectId, labels, subtasks } = req.body

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
        ...(labels !== undefined ? { labels } : {}),
        ...(subtasks !== undefined ? { subtasks } : {}),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, req.params.id))
      .returning()

    if (!updated) { res.status(404).json({ error: "Task not found" }); return }
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
    if (!task) { res.status(404).json({ error: "Task not found" }); return }

    const now = new Date()
    const [updated] = await db
      .update(tasks)
      .set({ status: "done", completedAt: now, updatedAt: now })
      .where(eq(tasks.id, req.params.id))
      .returning()

    if (task.assignedTo && task.points > 0 && !task.pointsAwarded) {
      const user = await db.query.users.findFirst({ where: eq(users.id, task.assignedTo) })
      if (user) {
        const gamification = (user.gamification as any) ?? { points: 0, level: 1, badges: [], achievements: [] }
        const newPoints = gamification.points + task.points
        const newLevel = Math.floor(newPoints / 100) + 1
        await db.update(users).set({ gamification: { ...gamification, points: newPoints, level: newLevel }, updatedAt: now }).where(eq(users.id, task.assignedTo))
        await db.update(tasks).set({ pointsAwarded: true }).where(eq(tasks.id, req.params.id))
        updated.pointsAwarded = true
      }
    }

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /tasks/:id
router.delete("/:id", requireAuth, requireRole("admin", "board_member"), async (req: AuthRequest, res) => {
  try {
    await db.delete(tasks).where(eq(tasks.id, req.params.id))
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ─── Task Comments ────────────────────────────────────────────────────────────

// GET /tasks/:id/comments
router.get("/:id/comments", requireAuth, async (req: AuthRequest, res) => {
  try {
    const comments = await db
      .select()
      .from(taskComments)
      .where(eq(taskComments.taskId, req.params.id))
      .orderBy(asc(taskComments.createdAt))

    // Enrich with user info
    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const [u] = await db.select().from(users).where(eq(users.id, comment.userId))
        return {
          ...comment,
          user: u ? { id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar } : null,
        }
      })
    )

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /tasks/:id/comments
router.post("/:id/comments", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) { res.status(400).json({ error: "content is required" }); return }

    const task = await db.query.tasks.findFirst({ where: eq(tasks.id, req.params.id) })
    if (!task) { res.status(404).json({ error: "Task not found" }); return }

    const [comment] = await db
      .insert(taskComments)
      .values({ taskId: req.params.id, userId: req.user!.id, content: content.trim() })
      .returning()

    const u = await db.query.users.findFirst({ where: eq(users.id, req.user!.id) })
    res.status(201).json({
      ...comment,
      user: u ? { id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar } : null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /tasks/:id/comments/:commentId
router.delete("/:id/comments/:commentId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [comment] = await db.select().from(taskComments).where(eq(taskComments.id, req.params.commentId))
    if (!comment) { res.status(404).json({ error: "Comment not found" }); return }

    // Only the author or admin/board_member can delete
    const role = req.user!.role
    if (comment.userId !== req.user!.id && role !== "admin" && role !== "board_member") {
      res.status(403).json({ error: "Forbidden" }); return
    }

    await db.delete(taskComments).where(eq(taskComments.id, req.params.commentId))
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
