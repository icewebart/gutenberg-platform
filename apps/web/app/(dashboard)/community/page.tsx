"use client"

export const runtime = "edge"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/components/auth-context"
import { useMultiTenant } from "@/components/multi-tenant-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getAvatarGradient } from "@/lib/avatar-gradient"
import {
  MessageSquare, Send, Plus, Loader2, Heart, Trash2, Users, Search, ArrowLeft, ImageIcon,
} from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Author { id: string; name: string; firstName?: string; lastName?: string; avatar?: string; role?: string }
interface Reply { id: string; postId: string; authorId: string; content: string; createdAt: string; author: Author | null }
interface Post {
  id: string; organizationId: string; authorId: string; title: string; content: string;
  category: string; likes: number; replyCount: number; createdAt: string;
  author: Author | null; replies?: Reply[]; imageUrl?: string | null
}
interface Member { id: string; name: string; firstName?: string; lastName?: string; avatar?: string }
interface MessageSender { id: string; name: string; firstName?: string; lastName?: string; avatar?: string }
interface Message { id: string; conversationId: string; senderId: string; content: string; createdAt: string; sender: MessageSender | null }
interface Conversation { id: string; participants: string[]; others: MessageSender[]; lastMessage: Message | null; createdAt: string }

// ─── Helpers ───────────────────────────────────────────────────────────────────
function displayName(u: any): string {
  if (!u) return "Unknown"
  if (u.firstName || u.lastName) return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
  return u.name || "Unknown"
}
function initials(u: any): string {
  const n = displayName(u); const parts = n.split(" ")
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : n.slice(0, 2).toUpperCase()
}
function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}
function UserAvatar({ user, size = "md" }: { user: any; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9"
  const tsz = size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs"
  return (
    <Avatar className={cn(sz, "shrink-0")}>
      {user?.avatar ? <AvatarImage src={user.avatar} /> : (
        <AvatarFallback className={cn(tsz, "text-white", `bg-gradient-to-br ${getAvatarGradient(displayName(user))}`)}>{initials(user)}</AvatarFallback>
      )}
    </Avatar>
  )
}

// Render message with @mention highlighting
function MentionText({ content, isMe }: { content: string; isMe: boolean }) {
  const parts = content.split(/(@\S+)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className={cn("font-semibold", isMe ? "text-blue-200" : "text-blue-600")}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-blue-50 text-blue-700",
  announcement: "bg-purple-50 text-purple-700",
  event: "bg-green-50 text-green-700",
  update: "bg-orange-50 text-orange-700",
}

// ─── Post Detail Modal ──────────────────────────────────────────────────────────
function PostDetailModal({
  post, currentUser, onClose, onReplyAdded, onLike,
}: {
  post: Post | null
  currentUser: any
  onClose: () => void
  onReplyAdded: (postId: string) => void
  onLike: (postId: string) => void
}) {
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [posting, setPosting] = useState(false)
  const repliesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!post) return
    setReplies([])
    setLoading(true)
    fetch(`/api/bff/community/posts/${post.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.replies) setReplies(data.replies) })
      .finally(() => setLoading(false))
  }, [post?.id])

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [replies])

  const handleReply = async () => {
    if (!post || !replyContent.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch(`/api/bff/community/posts/${post.id}/replies`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      })
      if (res.ok) {
        const reply = await res.json()
        setReplies((prev) => [...prev, reply])
        setReplyContent("")
        onReplyAdded(post.id)
      }
    } finally { setPosting(false) }
  }

  if (!post) return null

  return (
    <Dialog open={!!post} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Image */}
        {post.imageUrl && (
          <div className="relative w-full shrink-0" style={{ maxHeight: 320 }}>
            <img src={post.imageUrl} alt={post.title} className="w-full object-cover" style={{ maxHeight: 320 }} />
          </div>
        )}

        {/* Post header */}
        <div className="px-6 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-start gap-3">
            <UserAvatar user={post.author} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-gray-900">{displayName(post.author)}</span>
                {post.author?.role && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                    {post.author.role.replace("_", " ")}
                  </Badge>
                )}
                <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                {post.category && (
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-600")}>
                    {post.category}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{post.title}</h2>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pl-12">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="h-3.5 w-3.5" /> {post.likes}
            </button>
            <span className="text-xs text-gray-400">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
          </div>
        </div>

        {/* Replies list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : replies.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No replies yet. Be the first!</p>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <UserAvatar user={reply.author} size="sm" />
                <div className="flex-1 min-w-0 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-800">{displayName(reply.author)}</span>
                    <span className="text-[10px] text-gray-400">{timeAgo(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={repliesEndRef} />
        </div>

        {/* Reply input */}
        <div className="px-6 py-4 border-t bg-white shrink-0 flex gap-2 items-center">
          <UserAvatar user={currentUser} size="sm" />
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
              className="flex-1 h-9 text-sm rounded-xl"
            />
            <Button
              size="sm"
              onClick={handleReply}
              disabled={posting || !replyContent.trim()}
              className="h-9 px-3 rounded-xl"
            >
              {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Feed Tab ──────────────────────────────────────────────────────────────────
function FeedTab({ orgId, currentUser, canPost }: { orgId: string; currentUser: any; canPost: boolean }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [newPostOpen, setNewPostOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newCategory, setNewCategory] = useState("general")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [creating, setCreating] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bff/community/posts?organizationId=${orgId}`)
      if (res.ok) setPosts(await res.json())
    } finally { setLoading(false) }
  }, [orgId])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleLike = async (postId: string) => {
    await fetch(`/api/bff/community/posts/${postId}/like`, { method: "POST" })
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    setSelectedPost((prev) => prev?.id === postId ? { ...prev, likes: prev.likes + 1 } : prev)
  }

  const handleDelete = async (postId: string) => {
    await fetch(`/api/bff/community/posts/${postId}`, { method: "DELETE" })
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    if (selectedPost?.id === postId) setSelectedPost(null)
  }

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/bff/community/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory,
          imageUrl: newImageUrl.trim() || undefined,
        }),
      })
      if (res.ok) {
        const post = await res.json()
        setPosts((prev) => [post, ...prev])
        setNewPostOpen(false)
        setNewTitle(""); setNewContent(""); setNewCategory("general"); setNewImageUrl("")
      }
    } finally { setCreating(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
          {canPost && (
            <Button onClick={() => setNewPostOpen(true)} className="rounded-xl h-9">
              <Plus className="h-4 w-4 mr-1.5" /> New Post
            </Button>
          )}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No posts yet</p>
          </div>
        )}

        {posts.map((post) => {
          const canDelete = post.authorId === currentUser?.id || currentUser?.role === "admin" || currentUser?.role === "board_member"
          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedPost(post)}
            >
              {/* Image */}
              {post.imageUrl && (
                <div className="w-full aspect-video bg-gray-100">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="px-5 pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <UserAvatar user={post.author} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{displayName(post.author)}</span>
                      {post.author?.role && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                          {post.author.role.replace("_", " ")}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                      {post.category && (
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-600")}>
                          {post.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mt-1">{post.title}</h3>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                  </div>
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(post.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3 pl-12" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-3.5 w-3.5" /> {post.likes}
                  </button>
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Post detail modal */}
      <PostDetailModal
        post={selectedPost}
        currentUser={currentUser}
        onClose={() => setSelectedPost(null)}
        onReplyAdded={(postId) => setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p))}
        onLike={handleLike}
      />

      {/* New post dialog */}
      <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Post</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Post title..." className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="What do you want to share?" className="rounded-xl min-h-[120px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-gray-400" /> Image URL <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." className="rounded-xl" />
              {newImageUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                  <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={creating || !newTitle.trim() || !newContent.trim()} className="w-full rounded-xl">
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Publish Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Messages Tab ──────────────────────────────────────────────────────────────
function MessagesTab({ currentUser }: { currentUser: any }) {
  const { currentOrganization } = useMultiTenant()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")
  const [newMsgOpen, setNewMsgOpen] = useState(false)
  const [memberSearch, setMemberSearch] = useState("")

  // @mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(-1)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const orgId = currentOrganization?.id

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/bff/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(Array.isArray(data) ? data : [])
      }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  useEffect(() => {
    if (!orgId) return
    fetch(`/api/bff/members?organizationId=${orgId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setMembers(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [orgId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv); setLoadingMessages(true)
    try {
      const res = await fetch(`/api/bff/conversations/${conv.id}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      }
    } finally { setLoadingMessages(false) }
  }

  const startConversation = async (memberId: string) => {
    setNewMsgOpen(false); setMemberSearch("")
    const res = await fetch("/api/bff/conversations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantIds: [memberId] }),
    })
    if (res.ok) {
      const conv = await res.json()
      const fullRes = await fetch("/api/bff/conversations")
      if (fullRes.ok) {
        const all: Conversation[] = await fullRes.json()
        setConversations(Array.isArray(all) ? all : [])
        const found = (Array.isArray(all) ? all : []).find((c) => c.id === conv.id)
        if (found) openConversation(found)
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/bff/conversations/${activeConv.id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
        setNewMessage("")
        setConversations((prev) =>
          prev.map((c) => c.id === activeConv.id ? { ...c, lastMessage: msg } : c)
            .sort((a, b) => {
              const at = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
              const bt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
              return bt - at
            })
        )
      }
    } finally { setSending(false) }
  }

  // @mention detection
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const cursor = e.target.selectionStart ?? val.length
    setNewMessage(val)
    // Look for @word pattern just before cursor
    const before = val.slice(0, cursor)
    const match = before.match(/@(\w*)$/)
    if (match) {
      setMentionQuery(match[1].toLowerCase())
      setMentionStart(match.index!)
    } else {
      setMentionQuery(null)
      setMentionStart(-1)
    }
  }

  const insertMention = (member: Member) => {
    const name = displayName(member)
    const before = newMessage.slice(0, mentionStart)
    const afterOffset = mentionStart + 1 + (mentionQuery?.length ?? 0)
    const after = newMessage.slice(afterOffset)
    const updated = `${before}@${name}${after.startsWith(" ") ? after : " " + after}`
    setNewMessage(updated)
    setMentionQuery(null)
    setMentionStart(-1)
    messageInputRef.current?.focus()
  }

  const mentionMembers = mentionQuery !== null
    ? members.filter((m) => m.id !== currentUser?.id && displayName(m).toLowerCase().includes(mentionQuery))
    : []

  const filteredConvs = conversations.filter((c) => {
    if (!search) return true
    return displayName(c.others[0]).toLowerCase().includes(search.toLowerCase())
  })

  const availableMembers = members.filter((m) => {
    if (m.id === currentUser?.id) return false
    if (!memberSearch) return true
    return displayName(m).toLowerCase().includes(memberSearch.toLowerCase())
  })

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>

  return (
    <div className="flex h-[calc(100vh-220px)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className={cn("flex flex-col border-r", activeConv ? "hidden md:flex w-72 shrink-0" : "flex-1 md:w-72 md:flex-none md:shrink-0")}>
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Messages</span>
            <Button size="sm" onClick={() => setNewMsgOpen(true)} className="h-7 px-2 rounded-lg text-xs">
              <Plus className="h-3 w-3 mr-1" /> New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-8 h-8 text-xs rounded-lg" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No conversations yet</p>
              <button onClick={() => setNewMsgOpen(true)} className="text-xs text-blue-500 mt-1 hover:underline">Start one</button>
            </div>
          )}
          {filteredConvs.map((conv) => {
            const other = conv.others[0]
            const isActive = activeConv?.id === conv.id
            return (
              <button key={conv.id} onClick={() => openConversation(conv)}
                className={cn("w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50", isActive && "bg-blue-50 border-blue-100")}
              >
                <UserAvatar user={other} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{displayName(other)}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.lastMessage.senderId === currentUser?.id ? "You: " : ""}{conv.lastMessage.content}
                    </p>
                  )}
                </div>
                {conv.lastMessage && <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(conv.lastMessage.createdAt)}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Thread */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
            <button onClick={() => setActiveConv(null)} className="md:hidden p-1 text-gray-400 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <UserAvatar user={activeConv.others[0]} size="sm" />
            <div>
              <span className="text-sm font-semibold text-gray-800">{displayName(activeConv.others[0])}</span>
              <p className="text-[10px] text-gray-400">Direct message</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loadingMessages ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No messages yet. Say hello!</p>
              </div>
            ) : messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id
              return (
                <div key={msg.id} className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                  {!isMe && <UserAvatar user={msg.sender} size="sm" />}
                  <div className={cn("max-w-[70%] space-y-1", isMe ? "items-end" : "items-start")}>
                    <div className={cn("px-3 py-2 rounded-2xl text-sm leading-relaxed", isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm")}>
                      <MentionText content={msg.content} isMe={isMe} />
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">{timeAgo(msg.createdAt)}</span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input with @mention */}
          <div className="px-4 py-3 border-t bg-white">
            {/* Mention dropdown */}
            {mentionQuery !== null && mentionMembers.length > 0 && (
              <div className="mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                <div className="px-3 py-1.5 border-b bg-gray-50">
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Mention someone</span>
                </div>
                {mentionMembers.slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    onMouseDown={(e) => { e.preventDefault(); insertMention(m) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 text-left transition-colors"
                  >
                    <UserAvatar user={m} size="sm" />
                    <span className="text-sm font-medium text-gray-800">{displayName(m)}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                ref={messageInputRef}
                value={newMessage}
                onChange={handleMessageChange}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setMentionQuery(null); return }
                  if (e.key === "Enter" && !e.shiftKey && mentionQuery === null) sendMessage()
                }}
                placeholder="Type a message… use @ to mention"
                className="flex-1 rounded-xl h-10"
              />
              <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="h-10 px-3 rounded-xl">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Type @ to mention a team member</p>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 flex-col gap-3">
          <MessageSquare className="h-12 w-12 opacity-20" />
          <p className="text-sm">Select a conversation to start messaging</p>
        </div>
      )}

      {/* New message dialog */}
      <Dialog open={newMsgOpen} onOpenChange={setNewMsgOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Search members..." className="pl-9 rounded-xl" />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableMembers.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No members found</p>}
              {availableMembers.map((m) => (
                <button key={m.id} onClick={() => startConversation(m.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <UserAvatar user={m} size="sm" />
                  <span className="text-sm font-medium text-gray-800">{displayName(m)}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { user } = useAuth()
  const { currentOrganization } = useMultiTenant()
  const [tab, setTab] = useState<"feed" | "messages">("feed")
  const canPost = user?.role === "admin" || user?.role === "board_member"
  const orgId = currentOrganization?.id
  if (!user || !orgId) return null

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="text-sm text-gray-500 mt-0.5">Stay connected with your organization</p>
      </div>
      <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 w-fit">
        <button
          onClick={() => setTab("feed")}
          className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === "feed" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
        >
          <MessageSquare className="h-4 w-4 inline mr-1.5 -mt-0.5" /> Feed
        </button>
        <button
          onClick={() => setTab("messages")}
          className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === "messages" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
        >
          <Send className="h-4 w-4 inline mr-1.5 -mt-0.5" /> Messages
        </button>
      </div>
      {tab === "feed"
        ? <FeedTab orgId={orgId} currentUser={user} canPost={canPost} />
        : <MessagesTab currentUser={user} />
      }
    </div>
  )
}
