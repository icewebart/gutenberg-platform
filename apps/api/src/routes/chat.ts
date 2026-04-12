import { Router } from "express"
import { eq, desc } from "drizzle-orm"
import { db, chatConversations, chatMessages, users } from "../db"
import { requireAuth, type AuthRequest } from "../middleware/auth"

const router = Router()

// GET /conversations — list for current user, enriched with other participant + last message
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const all = await db.select().from(chatConversations)
    const mine = all.filter((c) => (c.participants as string[]).includes(req.user!.id))

    const enriched = await Promise.all(
      mine.map(async (conv) => {
        // Other participant info
        const otherIds = (conv.participants as string[]).filter((id) => id !== req.user!.id)
        const others = await Promise.all(
          otherIds.map(async (id) => {
            const [u] = await db.select().from(users).where(eq(users.id, id))
            return u ? { id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar } : null
          })
        )

        // Last message
        const messages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, conv.id))
          .orderBy(desc(chatMessages.createdAt))
        const lastMessage = messages[0] ?? null

        return { ...conv, others: others.filter(Boolean), lastMessage }
      })
    )

    // Sort by most recent message
    enriched.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
      return bTime - aTime
    })

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /conversations — find existing or create new
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { participantIds } = req.body as { participantIds: string[] }
    if (!participantIds?.length) {
      res.status(400).json({ error: "participantIds required" }); return
    }

    const participants = [...new Set([req.user!.id, ...participantIds])]

    // Check if a 1-on-1 conversation already exists
    if (participants.length === 2) {
      const all = await db.select().from(chatConversations)
      const existing = all.find((c) => {
        const p = c.participants as string[]
        return p.length === 2 && participants.every((id) => p.includes(id))
      })
      if (existing) { res.json(existing); return }
    }

    const [conversation] = await db.insert(chatConversations).values({ participants }).returning()
    res.status(201).json(conversation)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /conversations/:id/messages — enriched with sender info
router.get("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, req.params.id))
      .orderBy(chatMessages.createdAt)

    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const [u] = await db.select().from(users).where(eq(users.id, msg.senderId))
        return {
          ...msg,
          sender: u ? { id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar } : null,
        }
      })
    )

    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /conversations/:id/messages
router.post("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) { res.status(400).json({ error: "content required" }); return }

    const [message] = await db
      .insert(chatMessages)
      .values({ conversationId: req.params.id, senderId: req.user!.id, content: content.trim() })
      .returning()

    const [u] = await db.select().from(users).where(eq(users.id, req.user!.id))
    res.status(201).json({
      ...message,
      sender: u ? { id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar } : null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
