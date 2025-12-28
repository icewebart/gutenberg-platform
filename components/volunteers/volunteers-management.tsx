"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { mockVolunteers } from "@/data/volunteers-data"
import { VolunteerFilters } from "./volunteer-filters"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-context"
import { Award, UserPlus } from "lucide-react"
import { MemberManagementTabs } from "../members/member-management-tabs"

const DEPARTMENTS = ["HR", "PR", "FR", "AB", "Board", "Alumni"]
const AVAILABLE_YEARS = [2026, 2025, 2024, 2023]

export function VolunteersManagement() {
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const [isManagementDialogOpen, setManagementDialogOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: "",
    year: "2025",
    department: "all",
    status: "all",
    sort: "name_asc",
  })

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
    let filtered = mockVolunteers.filter((volunteer) => volunteer.organizationId === user.organizationId)

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (v) => v.name.toLowerCase().includes(searchLower) || v.email.toLowerCase().includes(searchLower),
      )
    }
    if (filters.year) {
      filtered = filtered.filter((v) => v.yearsOfActivity.includes(Number.parseInt(filters.year)))
    }
    if (filters.department !== "all") {
      filtered = filtered.filter((v) => v.department === filters.department)
    }
    if (filters.status !== "all") {
      filtered = filtered.filter((v) => (filters.status === "active" ? v.isActive : !v.isActive))
    }

    switch (filters.sort) {
      case "most_points":
        return filtered.sort((a, b) => b.gamification.points - a.gamification.points)
      case "most_active":
        return filtered.sort((a, b) => b.activityLog.length - a.activityLog.length)
      case "join_date_desc":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "name_asc":
      default:
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [user, filters])

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Volunteers</h1>
        {hasPermission("manage_volunteers") && (
          <Dialog open={isManagementDialogOpen} onOpenChange={setManagementDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Member Management</DialogTitle>
              </DialogHeader>
              <MemberManagementTabs />
            </DialogContent>
          </Dialog>
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
                    variant={volunteer.isActive ? "secondary" : "outline"}
                    className={volunteer.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {volunteer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {volunteer.yearsOfActivity.map((year) => (
                      <Badge key={year} variant="outline" className="font-mono">
                        {year}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 font-medium">
                    <Award className="h-4 w-4 text-yellow-500" />
                    {volunteer.gamification.points.toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
