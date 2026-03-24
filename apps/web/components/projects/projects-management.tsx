"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search, Loader2, FolderOpen, Calendar, MapPin, Users, Award, Globe, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useAuth } from "../auth-context"
import { useMultiTenant } from "../multi-tenant-context"

interface ApiProject {
  id: string
  organizationId: string
  title: string
  shortDescription: string
  projectDate: string
  startDate?: string
  endDate?: string
  location: string
  imageUrl?: string
  projectType: string
  status: string
  visibility?: string
  scale?: string
  category?: string
  maxParticipants?: number
  expectedParticipants?: number
  currentParticipants: number
  pointsReward: number
  goals?: string[]
  createdAt: string
}

const TYPE_LABELS: Record<string, string> = {
  camp: "Camp", conference: "Conference", workshop: "Workshop",
  online: "Online", training: "Training", study_visit: "Study Visit",
  youth_exchange: "Youth Exchange", sommerschule: "Sommerschule",
  wintercamp: "Wintercamp", event: "Event", other: "Other",
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  upcoming: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ongoing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

const COVER_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-700",
  "from-indigo-500 to-blue-700",
  "from-fuchsia-500 to-purple-700",
  "from-emerald-500 to-teal-700",
]

function projectGradient(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return COVER_GRADIENTS[h % COVER_GRADIENTS.length]
}

function formatDate(d?: string) {
  if (!d) return null
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function ProjectsManagement() {
  const router = useRouter()
  const { user, hasRole } = useAuth()
  const { currentOrganization } = useMultiTenant()

  const [projects, setProjects] = useState<ApiProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    if (!currentOrganization?.id) return
    setLoading(true)
    const params = new URLSearchParams({ organizationId: currentOrganization.id })
    fetch(`/api/bff/projects?${params}`)
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [currentOrganization?.id])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const matchType = typeFilter === "all" || p.projectType === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [projects, searchQuery, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: projects.length,
    draft: projects.filter((p) => p.status === "draft").length,
    upcoming: projects.filter((p) => p.status === "upcoming").length,
    ongoing: projects.filter((p) => p.status === "ongoing").length,
    completed: projects.filter((p) => p.status === "completed").length,
  }), [projects])

  const canCreate = hasRole(["admin", "board_member"])

  if (!user || !currentOrganization) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">All projects for {currentOrganization.name}</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/projects/create")} className="rounded-xl gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Draft", value: stats.draft, color: "text-gray-500" },
          { label: "Upcoming", value: stats.upcoming, color: "text-yellow-600" },
          { label: "Ongoing", value: stats.ongoing, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, color: "text-green-600" },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border-gray-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search projects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["draft", "upcoming", "ongoing", "completed", "cancelled"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-10 w-10 text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No projects found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters."
                : "Create your first project to get started."}
            </p>
            {canCreate && (
              <Button onClick={() => router.push("/projects/create")} className="rounded-xl gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: ApiProject }) {
  const gradient = projectGradient(project.id)
  const typeLabel = TYPE_LABELS[project.projectType] ?? project.projectType
  const statusStyle = STATUS_STYLES[project.status] ?? STATUS_STYLES.draft
  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1)
  const startFmt = formatDate(project.startDate)
  const endFmt = formatDate(project.endDate)

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="rounded-2xl border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full flex flex-col">
        {/* Cover */}
        {project.imageUrl ? (
          <div className="h-40 overflow-hidden">
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`h-32 bg-gradient-to-br ${gradient}`} />
        )}

        <CardContent className="flex-1 flex flex-col p-4 gap-3">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge className={`text-xs border pointer-events-none select-none ${statusStyle}`}>
              {statusLabel}
            </Badge>
            <Badge className="text-xs border bg-purple-50 text-purple-700 border-purple-200 pointer-events-none select-none">
              {typeLabel}
            </Badge>
            {project.visibility === "public" ? (
              <Badge className="text-xs border bg-gray-50 text-gray-600 border-gray-200 gap-1 pointer-events-none select-none">
                <Globe className="h-3 w-3" /> Public
              </Badge>
            ) : (
              <Badge className="text-xs border bg-gray-50 text-gray-600 border-gray-200 gap-1 pointer-events-none select-none">
                <Lock className="h-3 w-3" /> Internal
              </Badge>
            )}
          </div>

          {/* Title & description */}
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{project.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.shortDescription}</p>
          </div>

          {/* Meta */}
          <div className="mt-auto space-y-1.5 text-xs text-gray-500">
            {(startFmt || endFmt) && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {startFmt && endFmt ? `${startFmt} – ${endFmt}` : startFmt ?? endFmt}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
            {(project.expectedParticipants || project.maxParticipants) && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {project.expectedParticipants ?? project.maxParticipants} participants expected
                </span>
              </div>
            )}
            {project.pointsReward > 0 && (
              <div className="flex items-center gap-1.5 text-yellow-600">
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span>{project.pointsReward} pts reward</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
