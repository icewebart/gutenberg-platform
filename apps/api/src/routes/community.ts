import { Router } from "express"
import { eq } from "drizzle-orm"
import { db, communityPosts, communityReplies } from "../db"
import { requireAuth, type AuthRequest } from "../middleware/auth"
import { createPostSchema, createReplySchema } from "@gutenberg/shared"

const router = Router()

// GET /community/posts?organizationId=
router.get("/posts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { organizationId } = req.query as { organizationId?: string }
    const posts = await db.query.communityPosts.findMany({
      where: organizationId ? eq(communityPosts.organizationId, organizationId) : undefined,
    })
    res.json(posts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /community/posts/:id
router.get("/posts/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const post = await db.query.communityPosts.findFirst({
      where: eq(communityPosts.id, req.params.id),
    })
    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }
    const replies = await db.query.communityReplies.findMany({
      where: eq(communityReplies.postId, req.params.id),
    })
    res.json({ ...post, replies })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /community/posts
router.post("/posts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = createPostSchema.parse(req.body)
    const [post] = await db
      .insert(communityPosts)
      .values({ ...data, tags: data.tags ?? [], authorId: req.user!.id })
      .returning()
    res.status(201).json(post)
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /community/posts/:id/replies
router.post("/posts/:id/replies", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = createReplySchema.parse(req.body)
    const [reply] = await db
      .insert(communityReplies)
      .values({ ...data, postId: req.params.id, authorId: req.user!.id })
      .returning()
    res.status(201).json(reply)
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid request", details: err.errors })
      return
    }
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /community/posts/:id/like
router.post("/posts/:id/like", requireAuth, async (req: AuthRequest, res) => {
  try {
    const post = await db.query.communityPosts.findFirst({
      where: eq(communityPosts.id, req.params.id),
    })
    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }
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

export default router
