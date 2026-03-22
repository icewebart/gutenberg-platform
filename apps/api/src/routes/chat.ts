import { Router } from "express"
import { eq, or, sql } from "drizzle-orm"
import { db, chatConversations, chatMessages } from "../db"
import { requireAuth, type AuthRequest } from "../middleware/auth"

const router = Router()

// GET /conversations?userId=
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Find conversations where the current user is a participant
    const all = await db.query.chatConversations.findMany()
    const filtered = all.filter((c) =>
      (c.participants as string[]).includes(req.user!.id)
    )
    res.json(filtered)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /conversations
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { participantIds } = req.body as { participantIds: string[] }
    if (!participantIds?.length) {
      res.status(400).json({ error: "participantIds required" })
      return
    }

    const participants = [...new Set([req.user!.id, ...participantIds])]
    const [conversation] = await db
      .insert(chatConversations)
      .values({ participants })
      .returning()
    res.status(201).json(conversation)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /conversations/:id/messages
router.get("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.conversationId, req.params.id),
    })
    res.json(messages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /conversations/:id/messages
router.post("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body
    if (!content) {
      res.status(400).json({ error: "content required" })
      return
    }
    const [message] = await db
      .insert(chatMessages)
      .values({
        conversationId: req.params.id,
        senderId: req.user!.id,
        content,
      })
      .returning()
    res.status(201).json(message)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
