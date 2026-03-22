import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/organization'
import { useAuth } from '@/components/auth-context'
import { transformSupabaseUser } from '@/lib/supabase/user-helpers'

export function useVolunteers() {
  const [volunteers, setVolunteers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user: currentUser } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const fetchVolunteers = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*, auth.users!inner(email)')
          .eq('organization_id', currentUser.organizationId)
          .in('role', ['volunteer', 'board_member', 'admin'])
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Transform Supabase data to User type
        const transformedVolunteers: User[] = (data || []).map((u) => {
          // Get email from auth.users relation or fallback
          const authUser = { id: u.id, email: u.email }
          return transformSupabaseUser(u, authUser)
        })

        setVolunteers(transformedVolunteers)
        setError(null)
      } catch (err) {
        console.error('Error fetching volunteers:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch volunteers')
      } finally {
        setLoading(false)
      }
    }

    fetchVolunteers()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('volunteers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `organization_id=eq.${currentUser.organizationId}`,
        },
        () => {
          fetchVolunteers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser, supabase])

  const updateVolunteer = async (id: string, updates: Partial<User>) => {
    try {
      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.role !== undefined) updateData.role = updates.role
      if (updates.department !== undefined) updateData.department = updates.department
      if (updates.netzwerkCityId !== undefined)
        updateData.netzwerk_city_id = updates.netzwerkCityId || null
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.profile !== undefined) updateData.profile = updates.profile as any
      if (updates.gamification !== undefined) updateData.gamification = updates.gamification as any

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Fetch auth user email
      const { data: authData } = await supabase.auth.getUser()
      const authUser = authData?.user ? { id: authData.user.id, email: authData.user.email! } : { id: id, email: data.email }

      const transformedUser = transformSupabaseUser(data, authUser)
      setVolunteers((prev) =>
        prev.map((v) => (v.id === id ? transformedUser : v))
      )

      return { data: transformedUser, error: null }
    } catch (err) {
      console.error('Error updating volunteer:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update volunteer',
      }
    }
  }

  const addPoints = async (userId: string, points: number, reason: string) => {
    try {
      // Get current user data
      const volunteer = volunteers.find((v) => v.id === userId)
      if (!volunteer) return { error: 'Volunteer not found' }

      const currentPoints = volunteer.gamification.points
      const newPoints = currentPoints + points

      // Update gamification points
      const { error: updateError } = await supabase
        .from('users')
        .update({
          gamification: {
            ...volunteer.gamification,
            points: newPoints,
            level: Math.floor(newPoints / 100) + 1, // Simple level calculation
          },
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Add to points history
      await supabase.from('points_history').insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        reason,
        points,
        type: 'earned',
      })

      // Refresh volunteers list
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        const { data: authData } = await supabase.auth.getUser()
        const authUser = authData?.user ? { id: authData.user.id, email: authData.user.email! } : { id: userId, email: data.email }
        const transformedUser = transformSupabaseUser(data, authUser)
        setVolunteers((prev) =>
          prev.map((v) => (v.id === userId ? transformedUser : v))
        )
      }

      return { error: null }
    } catch (err) {
      console.error('Error adding points:', err)
      return {
        error: err instanceof Error ? err.message : 'Failed to add points',
      }
    }
  }

  return {
    volunteers,
    loading,
    error,
    updateVolunteer,
    addPoints,
  }
}

