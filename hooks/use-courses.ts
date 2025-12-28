import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Course } from '@/types/organization'
import { useAuth } from '@/components/auth-context'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchCourses = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .eq('organization_id', user.organizationId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Transform Supabase data to Course type
        const transformedCourses: Course[] = (data || []).map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          instructor: c.instructor,
          duration: c.duration,
          difficulty: c.difficulty as Course['difficulty'],
          category: c.category,
          organizationId: c.organization_id,
          modules: (c.modules as any) || [],
          enrolledUsers: c.enrolled_users || [],
          completedUsers: c.completed_users || [],
          isPublished: c.is_published,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }))

        setCourses(transformedCourses)
        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses',
          filter: `organization_id=eq.${user.organizationId}`,
        },
        () => {
          fetchCourses()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error: createError } = await supabase
        .from('courses')
        .insert({
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          duration: course.duration,
          difficulty: course.difficulty,
          category: course.category,
          organization_id: course.organizationId,
          modules: course.modules as any,
          enrolled_users: course.enrolledUsers,
          completed_users: course.completedUsers,
          is_published: course.isPublished,
        })
        .select()
        .single()

      if (createError) throw createError

      const transformedCourse: Course = {
        id: data.id,
        title: data.title,
        description: data.description,
        instructor: data.instructor,
        duration: data.duration,
        difficulty: data.difficulty as Course['difficulty'],
        category: data.category,
        organizationId: data.organization_id,
        modules: (data.modules as any) || [],
        enrolledUsers: data.enrolled_users || [],
        completedUsers: data.completed_users || [],
        isPublished: data.is_published,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      setCourses((prev) => [transformedCourse, ...prev])
      return { data: transformedCourse, error: null }
    } catch (err) {
      console.error('Error creating course:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to create course',
      }
    }
  }

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const updateData: any = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.instructor !== undefined) updateData.instructor = updates.instructor
      if (updates.duration !== undefined) updateData.duration = updates.duration
      if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.modules !== undefined) updateData.modules = updates.modules as any
      if (updates.enrolledUsers !== undefined) updateData.enrolled_users = updates.enrolledUsers
      if (updates.completedUsers !== undefined) updateData.completed_users = updates.completedUsers
      if (updates.isPublished !== undefined) updateData.is_published = updates.isPublished

      const { data, error: updateError } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: data.updated_at } : c))
      )

      return { data, error: null }
    } catch (err) {
      console.error('Error updating course:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Failed to update course',
      }
    }
  }

  const enrollInCourse = async (courseId: string) => {
    if (!user) return { error: 'Not authenticated' }

    try {
      // Add to enrolled_users array
      const course = courses.find((c) => c.id === courseId)
      if (!course) return { error: 'Course not found' }

      const updatedEnrolled = [...course.enrolledUsers]
      if (!updatedEnrolled.includes(user.id)) {
        updatedEnrolled.push(user.id)
      }

      const { error: updateError } = await supabase
        .from('courses')
        .update({ enrolled_users: updatedEnrolled })
        .eq('id', courseId)

      if (updateError) throw updateError

      // Also create enrollment record
      await supabase.from('course_enrollments').insert({
        user_id: user.id,
        course_id: courseId,
      })

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, enrolledUsers: updatedEnrolled } : c
        )
      )

      return { error: null }
    } catch (err) {
      console.error('Error enrolling in course:', err)
      return {
        error: err instanceof Error ? err.message : 'Failed to enroll in course',
      }
    }
  }

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    enrollInCourse,
  }
}

