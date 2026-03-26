import { Router } from "express"
import { eq, and, desc } from "drizzle-orm"
import { db, notifications, notificationPreferences } from "../db"
import { requireAuth, type AuthRequest } from "../middleware/auth"

const router = Router()

// ─── GET /notifications ──────────────────────────────────────────────────────
// Returns all notifications for the authenticated user (latest 50)

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const rows = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    })
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ─── PATCH /notifications/read-all ──────────────────────────────────────────
// Mark all notifications as read for the authenticated user

router.patch("/read-all", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ─── PATCH /notifications/:id/read ──────────────────────────────────────────
// Mark a single notification as read

router.patch("/:id/read", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ─── DELETE /notifications/:id ───────────────────────────────────────────────

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ─── GET /notifications/preferences ─────────────────────────────────────────

router.get("/preferences", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    let prefs = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    })
    if (!prefs) {
      // Return defaults if no row yet
      prefs = {
        id: "",
        userId,
        memberJoined: true,
        projectUpdates: true,
        taskAssigned: true,
        communityReplies: true,
        applicationUpdates: true,
        systemAlerts: false,
        updatedAt: new Date(),
      }
    }
    res.json(prefs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ─── PATCH /notifications/preferences ───────────────────────────────────────

router.patch("/preferences", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { memberJoined, projectUpdates, taskAssigned, communityReplies, applicationUpdates, systemAlerts } = req.body

    const existing = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    })

    if (existing) {
      const [updated] = await db
        .update(notificationPreferences)
        .set({
          memberJoined: memberJoined ?? existing.memberJoined,
          projectUpdates: projectUpdates ?? existing.projectUpdates,
          taskAssigned: taskAssigned ?? existing.taskAssigned,
          communityReplies: communityReplies ?? existing.communityReplies,
          applicationUpdates: applicationUpdates ?? existing.applicationUpdates,
          systemAlerts: systemAlerts ?? existing.systemAlerts,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, userId))
        .returning()
      res.json(updated)
    } else {
      const [created] = await db
        .insert(notificationPreferences)
        .values({
          userId,
          memberJoined: memberJoined ?? true,
          projectUpdates: projectUpdates ?? true,
          taskAssigned: taskAssigned ?? true,
          communityReplies: communityReplies ?? true,
          applicationUpdates: applicationUpdates ?? true,
          systemAlerts: systemAlerts ?? false,
        })
        .returning()
      res.json(created)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router

// ─── Helper: create a notification (used by other routes) ────────────────────

export async function createNotification(opts: {
  userId: string
  organizationId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  try {
    await db.insert(notifications).values(opts)
  } catch (err) {
    console.error("Failed to create notification:", err)
  }
}
