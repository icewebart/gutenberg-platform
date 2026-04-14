import { Router } from "express"
import { eq, desc } from "drizzle-orm"
import { db, communityPosts, communityReplies, users } from "../db"
import { requireAuth, type AuthRequest } from "../middleware/auth"

const router = Router()

async function enrichWithAuthor(record: any) {
  const [u] = await db.select().from(users).where(eq(users.id, record.authorId))
  return {
    ...record,
    author: u ? { id: u.id, name: u.name, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar, role: u.role } : null,
  }
}

// GET /community/posts?organizationId=
router.get("/posts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organizationId } = req.query as { organizationId?: string }
    const posts = await db
      .select()
      .from(communityPosts)
      .where(organizationId ? eq(communityPosts.organizationId, organizationId) : undefined)
      .orderBy(desc(communityPosts.createdAt))

    const enriched = await Promise.all(
      posts.map(async (post) => {
        const replies = await db.select().from(communityReplies).where(eq(communityReplies.postId, post.id))
        const withAuthor = await enrichWithAuthor(post)
        return { ...withAuthor, replyCount: replies.length }
      })
    )
    res.json(enriched)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /community/posts/:id
router.get("/posts/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, req.params.id))
    if (!post) { res.status(404).json({ error: "Post not found" }); return }

    const replies = await db
      .select()
      .from(communityReplies)
      .where(eq(communityReplies.postId, req.params.id))
      .orderBy(communityReplies.createdAt)

    const [enrichedPost, enrichedReplies] = await Promise.all([
      enrichWithAuthor(post),
      Promise.all(replies.map(enrichWithAuthor)),
    ])
    res.json({ ...enrichedPost, replies: enrichedReplies })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /community/posts — admin/board_member only
router.post("/posts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const role = req.user!.role
    if (role !== "admin" && role !== "board_member") {
      res.status(403).json({ error: "Only admins and board members can post" }); return
    }
    const { organizationId, title, content, category, imageUrl } = req.body
    if (!organizationId || !title || !content) {
      res.status(400).json({ error: "organizationId, title and content are required" }); return
    }
    const [post] = await db
      .insert(communityPosts)
      .values({ organizationId, title, content, category: category ?? "general", tags: [], authorId: req.user!.id, imageUrl: imageUrl ?? null })
      .returning()
    res.status(201).json(await enrichWithAuthor(post))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /community/posts/:id/replies — anyone can reply
router.post("/posts/:id/replies", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) { res.status(400).json({ error: "content is required" }); return }
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, req.params.id))
    if (!post) { res.status(404).json({ error: "Post not found" }); return }
    const [reply] = await db
      .insert(communityReplies)
      .values({ postId: req.params.id, authorId: req.user!.id, content: content.trim() })
      .returning()
    res.status(201).json(await enrichWithAuthor(reply))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /community/posts/:id/like
router.post("/posts/:id/like", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, req.params.id))
    if (!post) { res.status(404).json({ error: "Post not found" }); return }
    const [updated] = await db
      .update(communityPosts)
      .set({ likes: post.likes + 1, updatedAt: new Date() })
      .where(eq(communityPosts.id, req.params.id))
      .returning()
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /community/posts/:id
router.delete("/posts/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, req.params.id))
    if (!post) { res.status(404).json({ error: "Post not found" }); return }
    const role = req.user!.role
    if (post.authorId !== req.user!.id && role !== "admin" && role !== "board_member") {
      res.status(403).json({ error: "Forbidden" }); return
    }
    await db.delete(communityReplies).where(eq(communityReplies.postId, req.params.id))
    await db.delete(communityPosts).where(eq(communityPosts.id, req.params.id))
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
