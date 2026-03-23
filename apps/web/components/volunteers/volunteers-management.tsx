"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { VolunteerFilters } from "./volunteer-filters"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-context"
import { Award, UserPlus, Loader2 } from "lucide-react"
import { MemberManagementTabs } from "../members/member-management-tabs"
import { getAvatarGradient } from "@/lib/avatar-gradient"

const DEPARTMENTS = ["HR", "PR", "FR", "AB", "Board", "Alumni"]
const AVAILABLE_YEARS = [2026, 2025, 2024, 2023]

interface Member {
  id: string
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
  avatar?: string
  organizationId: string
  gamification?: { points: number; level: number }
  createdAt: string
}

export function VolunteersManagement() {
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isManagementDialogOpen, setManagementDialogOpen] = useState(false)

  const [filters, setFilters] = useState({
    search: "",
    year: "2025",
    department: "all",
    status: "all",
    sort: "name_asc",
  })

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (user?.role === "board_member" && user?.organizationId) {
          params.set("organizationId", user.organizationId)
        }
        const res = await fetch(`/api/bff/users?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setMembers(data)
        }
      } catch (err) {
        console.error("Failed to fetch members", err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchMembers()
  }, [user])

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }))
  }

  const clearFilters = () => {
    setFilters({ search: "", year: "2025", department: "all", status: "all", sort: "name_asc" })
  }

  const filteredMembers = useMemo(() => {
    let filtered = [...members]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
      )
    }
    if (filters.department !== "all") {
      filtered = filtered.filter((m) => m.department === filters.department)
    }
    if (filters.status !== "all") {
      filtered = filtered.filter((m) => (filters.status === "active" ? m.isActive : !m.isActive))
    }

    switch (filters.sort) {
      case "most_points":
        return filtered.sort((a, b) => (b.gamification?.points ?? 0) - (a.gamification?.points ?? 0))
      case "join_date_desc":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "name_asc":
      default:
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [members, filters])

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    const defaults: Record<string, string> = { search: "", year: "2025", department: "all", status: "all", sort: "name_asc" }
    return value !== defaults[key]
  }).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="title-page">Members</h1>
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

      <div className="border rounded-box bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No members found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow
                  key={member.id}
                  onClick={() => router.push(`/members/${member.id}`)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(member.id)} text-white text-xs font-bold`}>
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/members/${member.id}`}
                          className="font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {member.name}
                        </Link>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="capitalize">
                      {member.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{member.department}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={member.isActive ? "secondary" : "outline"}
                      className={member.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-gray-400">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 font-medium">
                      <Award className="h-4 w-4 text-yellow-500" />
                      {(member.gamification?.points ?? 0).toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
