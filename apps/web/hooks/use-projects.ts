import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types/organization'
import { useAuth } from '@/components/auth-context'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('organization_id', user.organizationId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Transform Supabase data to Project type
        const transformedProjects: Project[] = (data || []).map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status as Project['status'],
          priority: p.priority as Project['priority'],
          organizationId: p.organization_id,
          netzwerkCityId: p.netzwerk_city_id || undefined,
          managerId: p.manager_id,
          assignedVolunteers: p.assigned_volunteers || [],
          participants: p.participants || [],
          startDate: p.start_date,
          endDate: p.end_date || undefined,
          budget: p.budget ? Number(p.budget) : undefined,
          tags: p.tags || [],
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }))

        setProjects(transformedProjects)
        setError(null)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `organization_id=eq.${user.organizationId}`,
        },
        () => {
          fetchProjects()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          title: project.title,
          description: project.description,
          status: project.status,
          priority: project.priority,
          organization_id: project.organizationId,
          netzwerk_city_id: project.netzwerkCityId || null,
          manager_id: project.managerId,
          assigned_volunteers: project.assignedVolunteers,
          participants: project.participants,
          start_date: project.startDate,
          end_date: project.endDate || null,
          budget: project.budget || null,
          tags: project.tags,
        })
        .select()
        .single()

      if (createError) throw createError

      // Transform and add to state
      const transformedProject: Project = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status as Project['status'],
        priority: data.priority as Project['priority'],
        organizationId: data.organization_id,
        netzwerkCityId: data.netzwerk_city_id || undefined,
        managerId: data.manager_id,
        assignedVolunteers: data.assigned_volunteers || [],
        participants: data.participants || [],
        startDate: data.start_date,
        endDate: data.end_date || undefined,
        budget: data.budget ? Number(data.budget) : undefined,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      setProjects((prev) => [transformedProject, ...prev])
      return { data: transformedProject, error: null }
    } catch (err) {
      console.error('Error creating project:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create project',
      }
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updateData: any = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.priority !== undefined) updateData.priority = updates.priority
      if (updates.netzwerkCityId !== undefined)
        updateData.netzwerk_city_id = updates.netzwerkCityId || null
      if (updates.assignedVolunteers !== undefined)
        updateData.assigned_volunteers = updates.assignedVolunteers
      if (updates.participants !== undefined) updateData.participants = updates.participants
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate || null
      if (updates.budget !== undefined) updateData.budget = updates.budget || null
      if (updates.tags !== undefined) updateData.tags = updates.tags

      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update in state
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: data.updated_at } : p))
      )

      return { data, error: null }
    } catch (err) {
      console.error('Error updating project:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update project',
      }
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('projects').delete().eq('id', id)

      if (deleteError) throw deleteError

      setProjects((prev) => prev.filter((p) => p.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting project:', err)
      return {
        error: err instanceof Error ? err.message : 'Failed to delete project',
      }
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  }
}

