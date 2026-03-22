export const runtime = 'edge'
"use client"

import { useParams, useRouter } from "next/navigation"
import { mockVolunteers } from "@/data/volunteers-data"
import { VolunteerDetailPage } from "@/components/volunteers/volunteer-detail-page"
import { useEffect, useState } from "react"
import type { User as Volunteer } from "@/types/organization"
import { useAuth } from "@/components/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function VolunteerPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const { user, loading } = useAuth()
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers)
  const [activeTab, setActiveTab] = useState("volunteers")

  useEffect(() => {
    if (user && user.id === id) {
      setVolunteer(user as Volunteer)
    } else {
      const foundVolunteer = volunteers.find((v) => v.id === id)
      if (foundVolunteer) {
        setVolunteer(foundVolunteer)
      }
    }
  }, [id, volunteers, user])

  const handleUpdateVolunteer = (updatedVolunteer: Volunteer) => {
    const updatedVolunteers = volunteers.map((v) => (v.id === updatedVolunteer.id ? updatedVolunteer : v))
    setVolunteers(updatedVolunteers)
    setVolunteer(updatedVolunteer)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Navigate to the appropriate route when tab changes
    if (tab === "volunteers") {
      router.push("/")
    } else {
      router.push("/")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!volunteer) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg text-gray-600 mb-4">Volunteer not found.</p>
              <Button onClick={() => router.push("/")}>Go Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Volunteers
        </Button>
        <VolunteerDetailPage volunteer={volunteer} onUpdate={handleUpdateVolunteer} />
      </div>
    </DashboardLayout>
  )
}
