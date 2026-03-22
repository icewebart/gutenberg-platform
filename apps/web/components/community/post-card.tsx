"use client"

import type React from "react"

import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Eye, Pin, Lock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "../role-badge"
import type { CommunityPost } from "../../data/community-data"

interface PostCardProps {
  post: CommunityPost
  onClick: () => void
  onLike: (postId: string) => void
  currentUserId?: string
}

const categoryColors = {
  announcements: "bg-blue-100 text-blue-800",
  questions: "bg-yellow-100 text-yellow-800",
  projects: "bg-purple-100 text-purple-800",
  resources: "bg-green-100 text-green-800",
  events: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
}

const categoryIcons = {
  announcements: "📢",
  questions: "❓",
  projects: "🚀",
  resources: "📚",
  events: "📅",
  general: "💬",
}

export function PostCard({ post, onClick, onLike, currentUserId }: PostCardProps) {
  const isLiked = currentUserId ? post.likedBy.includes(currentUserId) : false

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike(post.id)
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.general
  }

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.general
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
              <AvatarFallback>
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                <RoleBadge role={post.author.role} />
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {post.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
            {post.isLocked && <Lock className="h-4 w-4 text-gray-500" />}
            {post.isResolved && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Category and Tags */}
        <div className="flex items-center space-x-2">
          <Badge className={getCategoryColor(post.category)}>
            <span className="mr-1">{getCategoryIcon(post.category)}</span>
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </Badge>
        </div>

        {/* Title and Content */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-3">{post.content}</p>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${isLiked ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-red-600"}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{post.likes}</span>
            </Button>

            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="h-4 w-4" />
              <span>{post.replies.length}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="h-4 w-4" />
              <span>{post.views}</span>
            </div>
          </div>

          {post.replies.length > 0 && (
            <div className="flex -space-x-2">
              {post.replies.slice(0, 3).map((reply, index) => (
                <Avatar key={reply.id} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                  <AvatarFallback className="text-xs">
                    {reply.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {post.replies.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{post.replies.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
