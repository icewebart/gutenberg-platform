"use client"

import { useParams, useRouter } from "next/navigation"
import { VolunteerDetailPage } from "@/components/volunteers/volunteer-detail-page"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Volunteer {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  department: string
  organization_id: string
  netzwerk_city_id?: string
  avatar?: string
  is_active: boolean
  is_verified: boolean
  status: string
  last_login?: string
  years_of_activity: number[]
  bio?: string
  location?: string
  skills: string[]
  interests: string[]
  availability: string
  social_links?: any
  was_member_in_netzwerk?: boolean
  gamification_points: number
  gamification_level: number
  gamification_badges: string[]
  gamification_achievements: string[]
  created_at: string
  activityLog?: any[]
  pointsHistory?: any[]
  watchedCourses?: any[]
  enrolledCourses?: string[]
  projectHistory?: any[]
}

export default function VolunteerPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const { user, loading } = useAuth()
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [volunteerLoading, setVolunteerLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user && id) {
      fetchVolunteer()
    }
  }, [id, user])

  const fetchVolunteer = async () => {
    try {
      // Fetch volunteer profile
      const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", id).single()

      if (profileError) {
        console.error("Error fetching volunteer:", profileError)
        return
      }

      // Fetch activity logs
      const { data: activityLogs, error: activityError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", id)
        .order("date", { ascending: false })

      // Fetch points history
      const { data: pointsHistory, error: pointsError } = await supabase
        .from("points_history")
        .select("*")
        .eq("user_id", id)
        .order("date", { ascending: false })

      // Fetch watched courses
      const { data: watchedCourses, error: watchedError } = await supabase
        .from("watched_courses")
        .select("*")
        .eq("user_id", id)

      // Combine all data
      const volunteerData: Volunteer = {
        ...profile,
        activityLog: activityLogs || [],
        pointsHistory: pointsHistory || [],
        watchedCourses: watchedCourses || [],
        enrolledCourses: [], // TODO: Implement enrolled courses
        projectHistory: [], // TODO: Implement project history
      }

      setVolunteer(volunteerData)
    } catch (error) {
      console.error("Error fetching volunteer data:", error)
    } finally {
      setVolunteerLoading(false)
    }
  }

  const handleUpdateVolunteer = async (updatedVolunteer: Volunteer) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: updatedVolunteer.name,
          email: updatedVolunteer.email,
          phone: updatedVolunteer.phone,
          role: updatedVolunteer.role,
          department: updatedVolunteer.department,
          is_active: updatedVolunteer.is_active,
          bio: updatedVolunteer.bio,
          location: updatedVolunteer.location,
          skills: updatedVolunteer.skills,
          interests: updatedVolunteer.interests,
          availability: updatedVolunteer.availability,
          social_links: updatedVolunteer.social_links,
          was_member_in_netzwerk: updatedVolunteer.was_member_in_netzwerk,
        })
        .eq("id", updatedVolunteer.id)

      if (error) {
        console.error("Error updating volunteer:", error)
        return
      }

      setVolunteer(updatedVolunteer)
    } catch (error) {
      console.error("Error updating volunteer:", error)
    }
  }

  if (loading || volunteerLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!volunteer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">Volunteer not found.</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Volunteers
      </Button>
      <VolunteerDetailPage volunteer={volunteer} onUpdate={handleUpdateVolunteer} />
    </div>
  )
}
