import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CommunityPost, CommunityReply } from '@/types/organization'
import { useAuth } from '@/components/auth-context'

export function useCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchPosts = async () => {
      try {
        setLoading(true)
        const { data: postsData, error: postsError } = await supabase
          .from('community_posts')
          .select('*')
          .eq('organization_id', user.organizationId)
          .order('created_at', { ascending: false })

        if (postsError) throw postsError

        // Fetch author data for all posts
        const authorIds = [...new Set((postsData || []).map(p => p.author_id))]
        const { data: authorsData } = await supabase
          .from('users')
          .select('id, name, email, role, avatar')
          .in('id', authorIds.length > 0 ? authorIds : [''])

        const authorsMap = new Map((authorsData || []).map(a => [a.id, a]))

        // Fetch replies for each post
        const postsWithReplies = await Promise.all(
          (postsData || []).map(async (post) => {
            const { data: repliesData } = await supabase
              .from('community_replies')
              .select('*')
              .eq('post_id', post.id)
              .order('created_at', { ascending: true })

            // Fetch reply authors
            const replyAuthorIds = [...new Set((repliesData || []).map(r => r.author_id))]
            const { data: replyAuthorsData } = replyAuthorIds.length > 0 ? await supabase
              .from('users')
              .select('id, name, email, role, avatar')
              .in('id', replyAuthorIds) : { data: [] }
            
            const replyAuthorsMap = new Map((replyAuthorsData || []).map(a => [a.id, a]))

            const replies: CommunityReply[] = (repliesData || []).map((r) => {
              const author = replyAuthorsMap.get(r.author_id)
              return {
                id: r.id,
                content: r.content,
                authorId: r.author_id,
                postId: r.post_id,
                parentReplyId: r.parent_reply_id || undefined,
                likes: r.likes,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
                // Add author data for compatibility
                author: author ? {
                  id: author.id,
                  name: author.name,
                  email: author.email,
                  role: author.role as any,
                  avatar: author.avatar || undefined,
                } as any : undefined,
              }
            })

            const author = authorsMap.get(post.author_id)
            const transformedPost: CommunityPost & { author?: any } = {
              id: post.id,
              title: post.title,
              content: post.content,
              authorId: post.author_id,
              organizationId: post.organization_id,
              category: post.category,
              tags: post.tags || [],
              likes: post.likes,
              replies,
              isPinned: post.is_pinned,
              isModerated: post.is_moderated,
              createdAt: post.created_at,
              updatedAt: post.updated_at,
              // Add author data for compatibility with components
              author: author ? {
                id: author.id,
                name: author.name,
                email: author.email,
                role: author.role as any,
                avatar: author.avatar || undefined,
              } as any : undefined,
            }
            return transformedPost
          })
        )

        setPosts(postsWithReplies)
        setError(null)
      } catch (err) {
        console.error('Error fetching community posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch community posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('community-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
          filter: `organization_id=eq.${user.organizationId}`,
        },
        () => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const createPost = async (post: Omit<CommunityPost, 'id' | 'replies' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return { data: null, error: 'Not authenticated' }

    try {
      const { data, error: createError } = await supabase
        .from('community_posts')
        .insert({
          title: post.title,
          content: post.content,
          author_id: user.id,
          organization_id: post.organizationId,
          category: post.category,
          tags: post.tags,
          likes: 0,
          liked_by: [],
          is_pinned: false,
          is_moderated: false,
        })
        .select()
        .single()

      if (createError) throw createError

      const newPost: CommunityPost = {
        id: data.id,
        title: data.title,
        content: data.content,
        authorId: data.author_id,
        organizationId: data.organization_id,
        category: data.category,
        tags: data.tags || [],
        likes: data.likes,
        replies: [],
        isPinned: data.is_pinned,
        isModerated: data.is_moderated,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      setPosts((prev) => [newPost, ...prev])
      return { data: newPost, error: null }
    } catch (err) {
      console.error('Error creating post:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create post',
      }
    }
  }

  const toggleLike = async (postId: string) => {
    if (!user) return { error: 'Not authenticated' }

    try {
      const post = posts.find((p) => p.id === postId)
      if (!post) return { error: 'Post not found' }

      // Fetch current liked_by array from database
      const { data: currentPost } = await supabase
        .from('community_posts')
        .select('liked_by')
        .eq('id', postId)
        .single()

      const likedBy = (currentPost?.liked_by as string[]) || []
      const isLiked = likedBy.includes(user.id)
      const newLikedBy = isLiked
        ? likedBy.filter((id) => id !== user.id)
        : [...likedBy, user.id]

      const { error: updateError } = await supabase
        .from('community_posts')
        .update({
          likes: newLikedBy.length,
          liked_by: newLikedBy,
        })
        .eq('id', postId)

      if (updateError) throw updateError

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes: newLikedBy.length }
            : p
        )
      )

      return { error: null }
    } catch (err) {
      console.error('Error toggling like:', err)
      return {
        error: err instanceof Error ? err.message : 'Failed to toggle like',
      }
    }
  }

  const addReply = async (postId: string, content: string, parentReplyId?: string) => {
    if (!user) return { data: null, error: 'Not authenticated' }

    try {
      const { data, error: createError } = await supabase
        .from('community_replies')
        .insert({
          content,
          author_id: user.id,
          post_id: postId,
          parent_reply_id: parentReplyId || null,
          likes: 0,
        })
        .select()
        .single()

      if (createError) throw createError

      const newReply: CommunityReply = {
        id: data.id,
        content: data.content,
        authorId: data.author_id,
        postId: data.post_id,
        parentReplyId: data.parent_reply_id || undefined,
        likes: data.likes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p
        )
      )

      return { data: newReply, error: null }
    } catch (err) {
      console.error('Error adding reply:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to add reply',
      }
    }
  }

  return {
    posts,
    loading,
    error,
    createPost,
    toggleLike,
    addReply,
  }
}

