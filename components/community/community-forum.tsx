"use client"

import { useState, useMemo } from "react"
import { Plus, TrendingUp, MessageCircle, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommunityFilters } from "./community-filters"
import { PostCard } from "./post-card"
import { PostDetailModal } from "./post-detail-modal"
import { CreatePostModal } from "./create-post-modal"
import { useAuth } from "../auth-context"
import { mockCommunityPosts, type CommunityPost } from "../../data/community-data"

export function CommunityForum() {
  const { user, hasPermission } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")

  const canCreatePost = hasPermission("post_community") || hasPermission("*")

  // Get all available tags
  const availableTags = useMemo(() => {
    const allTags = posts.flatMap((post) => post.tags)
    return Array.from(new Set(allTags)).sort()
  }, [posts])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts

    // Filter by tab
    if (activeTab === "pinned") {
      filtered = filtered.filter((post) => post.isPinned)
    } else if (activeTab === "trending") {
      // Simple trending logic: posts with high engagement in last 7 days
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = filtered.filter((post) => {
        const postDate = new Date(post.createdAt)
        return postDate > weekAgo && (post.likes > 5 || post.replies.length > 3)
      })
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author.name.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) => selectedTags.some((tag) => post.tags.includes(tag)))
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "most-liked":
          return b.likes - a.likes
        case "most-replies":
          return b.replies.length - a.replies.length
        case "most-views":
          return b.views - a.views
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [posts, activeTab, searchQuery, selectedCategory, selectedTags, sortBy])

  // Stats
  const stats = useMemo(() => {
    const totalPosts = posts.length
    const totalReplies = posts.reduce((sum, post) => sum + post.replies.length, 0)
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0)
    const activeUsers = new Set(posts.map((post) => post.author.id)).size

    return {
      totalPosts,
      totalReplies,
      totalViews,
      activeUsers,
    }
  }, [posts])

  const handleCreatePost = (postData: {
    title: string
    content: string
    category: string
    tags: string[]
  }) => {
    if (!user) return

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      title: postData.title,
      content: postData.content,
      author: user,
      category: postData.category,
      tags: postData.tags,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: [],
      views: 0,
      isPinned: false,
      isLocked: false,
    }

    setPosts([newPost, ...posts])
  }

  const handleLikePost = (postId: string) => {
    if (!user) return

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isLiked = post.likedBy.includes(user.id)
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedBy: isLiked ? post.likedBy.filter((id) => id !== user.id) : [...post.likedBy, user.id],
          }
        }
        return post
      }),
    )
  }

  const handleReplyToPost = (postId: string, content: string) => {
    if (!user) return

    const newReply = {
      id: `reply-${Date.now()}`,
      content,
      author: user,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    }

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: [...post.replies, newReply],
          }
        }
        return post
      }),
    )
  }

  const handlePinPost = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return { ...post, isPinned: !post.isPinned }
        }
        return post
      }),
    )
  }

  const handleLockPost = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return { ...post, isLocked: !post.isLocked }
        }
        return post
      }),
    )
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
    setIsPostModalOpen(false)
    setSelectedPost(null)
  }

  const handleSharePost = (post: CommunityPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${post.title}\n\n${post.content}`)
    }
  }

  const handlePostClick = (post: CommunityPost) => {
    // Increment view count
    setPosts(
      posts.map((p) => {
        if (p.id === post.id) {
          return { ...p, views: p.views + 1 }
        }
        return p
      }),
    )

    setSelectedPost(post)
    setIsPostModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-1">Connect, share, and collaborate with the community</p>
        </div>
        {canCreatePost && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Replies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReplies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="pinned">Pinned</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filters */}
          <CommunityFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            sortBy={sortBy}
            onSortChange={setSortBy}
            availableTags={availableTags}
          />

          {/* Posts */}
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => handlePostClick(post)}
                  onLike={handleLikePost}
                  currentUserId={user?.id}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || selectedCategory !== "all" || selectedTags.length > 0
                      ? "Try adjusting your filters to see more posts."
                      : "Be the first to start a conversation!"}
                  </p>
                  {canCreatePost && (
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false)
          setSelectedPost(null)
        }}
        onLike={handleLikePost}
        onReply={handleReplyToPost}
        onPin={handlePinPost}
        onLock={handleLockPost}
        onDelete={handleDeletePost}
        onShare={handleSharePost}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  )
}
