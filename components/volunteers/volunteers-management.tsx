"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { VolunteerFilters } from "./volunteer-filters"
import { InviteVolunteerModal } from "./invite-volunteer-modal"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { Award } from "lucide-react"

const DEPARTMENTS = ["HR", "PR", "FR", "AB", "Board", "Alumni"]
const AVAILABLE_YEARS = [2026, 2025, 2024, 2023]

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
}

export function VolunteersManagement() {
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteModalOpen, setInviteModalOpen] = useState(false)
  const supabase = createClient()

  const [filters, setFilters] = useState({
    search: "",
    year: "2025",
    department: "all",
    status: "all",
    sort: "name_asc",
  })

  useEffect(() => {
    if (user) {
      fetchVolunteers()
    }
  }, [user])

  const fetchVolunteers = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("organization_id", user.organization_id)

      if (error) {
        console.error("Error fetching volunteers:", error)
        return
      }

      setVolunteers(data || [])
    } catch (error) {
      console.error("Error fetching volunteers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      year: "2025",
      department: "all",
      status: "all",
      sort: "name_asc",
    })
  }

  const filteredVolunteers = useMemo(() => {
    if (!user) return []
    let filtered = volunteers.filter((volunteer) => volunteer.organization_id === user.organization_id)

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (v) => v.name.toLowerCase().includes(searchLower) || v.email.toLowerCase().includes(searchLower),
      )
    }
    if (filters.year) {
      filtered = filtered.filter((v) => v.years_of_activity.includes(Number.parseInt(filters.year)))
    }
    if (filters.department !== "all") {
      filtered = filtered.filter((v) => v.department === filters.department)
    }
    if (filters.status !== "all") {
      filtered = filtered.filter((v) => (filters.status === "active" ? v.is_active : !v.is_active))
    }

    switch (filters.sort) {
      case "most_points":
        return filtered.sort((a, b) => b.gamification_points - a.gamification_points)
      case "most_active":
        return filtered.sort((a, b) => b.years_of_activity.length - a.years_of_activity.length)
      case "join_date_desc":
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "name_asc":
      default:
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [user, volunteers, filters])

  const handleRowClick = (volunteerId: string) => {
    router.push(`/volunteers/${volunteerId}`)
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    const defaults: { [key: string]: string } = {
      search: "",
      year: "2025",
      department: "all",
      status: "all",
      sort: "name_asc",
    }
    return value !== defaults[key]
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Volunteers</h1>
        {hasPermission("manage_volunteers") && (
          <Button onClick={() => setInviteModalOpen(true)}>Invite Volunteer</Button>
        )}
      </div>
      <VolunteerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        years={AVAILABLE_YEARS}
        departments={DEPARTMENTS}
        activeFiltersCount={activeFiltersCount}
      />
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Activity Years</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVolunteers.map((volunteer) => (
              <TableRow
                key={volunteer.id}
                onClick={() => handleRowClick(volunteer.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={volunteer.avatar || "/placeholder.svg"} alt={volunteer.name} />
                      <AvatarFallback>
                        {volunteer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">
                      <Link
                        href={`/volunteers/${volunteer.id}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {volunteer.name}
                      </Link>
                      <div className="text-sm text-muted-foreground md:hidden">{volunteer.department}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{volunteer.department}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant={volunteer.is_active ? "secondary" : "outline"}
                    className={volunteer.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {volunteer.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {volunteer.years_of_activity.map((year) => (
                      <Badge key={year} variant="outline" className="font-mono">
                        {year}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 font-medium">
                    <Award className="h-4 w-4 text-yellow-500" />
                    {volunteer.gamification_points.toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {hasPermission("manage_volunteers") && (
        <InviteVolunteerModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} />
      )}
    </div>
  )
}
