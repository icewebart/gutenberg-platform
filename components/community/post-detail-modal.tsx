"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Send, Pin, Lock, MoreHorizontal, X, Eye, Share2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RoleBadge } from "../role-badge"
import { useAuth } from "../auth-context"
import type { CommunityPost, CommunityReply } from "../../data/community-data"

interface PostDetailModalProps {
  post: CommunityPost | null
  isOpen: boolean
  onClose: () => void
  onLike: (postId: string) => void
  onReply: (postId: string, content: string, parentId?: string) => void
  onPin: (postId: string) => void
  onLock: (postId: string) => void
  onDelete: (postId: string) => void
  onShare: (post: CommunityPost) => void
}

const categoryColors = {
  announcements: "bg-blue-100 text-blue-800",
  questions: "bg-yellow-100 text-yellow-800",
  projects: "bg-purple-100 text-purple-800",
  resources: "bg-green-100 text-green-800",
  events: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
}

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  onLike,
  onReply,
  onPin,
  onLock,
  onDelete,
  onShare,
}: PostDetailModalProps) {
  const { user } = useAuth()
  const [replyContent, setReplyContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)

  if (!post) return null

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(post.id)
  }

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(post.id, replyContent, replyingTo || undefined)
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const handleShare = () => {
    onShare(post)
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.general
  }

  const canModerate = user?.role === "admin" || user?.role === "manager" || user?.role === "board_member"
  const canDelete = canModerate || post.author.id === user?.id

  const ReplyComponent = ({ reply, level = 0 }: { reply: CommunityReply; level?: number }) => (
    <div className={`${level > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="flex items-start space-x-3 py-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
          <AvatarFallback>
            {reply.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm">{reply.author.name}</p>
            <RoleBadge role={reply.author.role} />
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600">
              <Heart className="h-3 w-3" />
              <span>{reply.likes}</span>
            </button>
            <button className="text-xs text-gray-500 hover:text-blue-600" onClick={() => setReplyingTo(reply.id)}>
              Reply
            </button>
          </div>
        </div>
      </div>
      {reply.replies &&
        reply.replies.map((nestedReply) => (
          <ReplyComponent key={nestedReply.id} reply={nestedReply} level={level + 1} />
        ))}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                <AvatarFallback>
                  {post.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-lg">{post.author.name}</DialogTitle>
                  <RoleBadge role={post.author.role} />
                  {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                  {post.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
                </div>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canModerate && (
                      <>
                        <DropdownMenuItem onClick={() => onPin(post.id)}>
                          {post.isPinned ? "Unpin" : "Pin"} Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onLock(post.id)}>
                          {post.isLocked ? "Unlock" : "Lock"} Post
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-600">
                      Delete Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getCategoryColor(post.category)}>
                {post.category}
              </Badge>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-t border-b">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  <span>{post.likes + (isLiked ? 1 : 0)} Likes</span>
                </button>

                <div className="flex items-center space-x-2 text-gray-500">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>{post.replies.length} Replies</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-500">
                  <Eye className="h-4 w-4 mr-2" />
                  <span>{post.views}</span>
                </div>
              </div>

              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-1">
            {post.replies.length > 0 ? (
              post.replies.map((reply) => <ReplyComponent key={reply.id} reply={reply} />)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No replies yet. Be the first to reply!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {!post.isLocked && (
          <div className="p-6 border-t">
            {replyingTo && (
              <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                Replying to a comment...
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="ml-2 h-6 px-2">
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button onClick={handleReply} disabled={!replyContent.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
