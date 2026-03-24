"use client"

export const runtime = "edge"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Globe,
  Lock,
  Award,
  Flag,
  Target,
  BarChart3,
  Building2,
  Wallet,
  ExternalLink,
  Edit,
  Loader2,
  ClipboardList,
  Copy,
  Check,
  UserCheck,
  UserX,
  Link2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-context"
import { getAvatarGradient } from "@/lib/avatar-gradient"

interface Application {
  id: string
  projectId: string
  userId?: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  formData: Record<string, unknown>
  paymentStatus: string
  stripeSessionId?: string
  status: string
  tempPassword?: string
  createdAt: string
}

interface ApiProject {
  id: string
  organizationId: string
  title: string
  shortDescription: string
  longDescription: string
  projectDate: string
  startDate?: string
  endDate?: string
  location: string
  imageUrl?: string
  projectManagerId?: string
  projectType: string
  status: string
  visibility?: string
  maxParticipants?: number
  expectedParticipants?: number
  currentParticipants: number
  pointsReward: number
  category?: string
  scale?: string
  funding?: string
  goals?: string[]
  kpis?: string[]
  partnerOrganizations?: string[]
  budget?: number
  currency?: string
  registrationLink?: string
  registrationEnabled?: boolean
  applicationFee?: number | null
  autoApprove?: boolean
  formFields?: unknown[]
  createdBy: string
  createdAt: string
  updatedAt: string
  members?: Array<{ id: string; userId: string; role: string; joinedAt: string }>
}

interface MemberUser {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  role: string
  department: string
}

const TYPE_LABELS: Record<string, string> = {
  camp: "Camp", conference: "Conference", workshop: "Workshop",
  online: "Online", training: "Training", study_visit: "Study Visit",
  youth_exchange: "Youth Exchange", sommerschule: "Sommerschule",
  wintercamp: "Wintercamp", event: "Event", other: "Other",
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  upcoming: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ongoing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

const SCALE_LABELS: Record<string, string> = {
  local: "Local", national: "National", european: "European", international: "International",
}

const FUNDING_LABELS: Record<string, string> = {
  self_funded: "Self-funded", erasmus_plus: "Erasmus+",
  national_grant: "National Grant", sponsored: "Sponsored", other: "Other",
}

const CATEGORY_LABELS: Record<string, string> = {
  education: "Education", culture: "Culture", environment: "Environment",
  social: "Social", sport: "Sport", other: "Other",
}

function memberDisplayName(m: MemberUser) {
  if (m.firstName || m.lastName) return `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
  return m.name
}

function memberInitials(m: MemberUser) {
  const n = memberDisplayName(m)
  const parts = n.split(" ")
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : n.slice(0, 2).toUpperCase()
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, hasRole } = useAuth()

  const [project, setProject] = useState<ApiProject | null>(null)
  const [memberUsers, setMemberUsers] = useState<MemberUser[]>([])
  const [manager, setManager] = useState<MemberUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [linkedTasksCount, setLinkedTasksCount] = useState(0)
  const [applications, setApplications] = useState<Application[]>([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [regEnabled, setRegEnabled] = useState(false)
  const [regToggling, setRegToggling] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/bff/projects/${id}`)
      .then((r) => r.json())
      .then(async (p: ApiProject) => {
        setProject(p)
        setRegEnabled(p.registrationEnabled ?? false)
        // Fetch member user details
        if (p.members?.length) {
          const userRes = await fetch(`/api/bff/users`)
          const allUsers: MemberUser[] = await userRes.json().catch(() => [])
          const memberIds = new Set(p.members.map((m) => m.userId))
          const filtered = allUsers.filter((u) => memberIds.has(u.id))
          setMemberUsers(filtered)
          if (p.projectManagerId) {
            setManager(allUsers.find((u) => u.id === p.projectManagerId) ?? null)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  // Fetch tasks linked to this project
  useEffect(() => {
    if (!id) return
    fetch(`/api/bff/tasks?projectId=${id}`)
      .then((r) => r.json())
      .then((data) => setLinkedTasksCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {})
  }, [id])

  // Fetch applications (admin/board_member only)
  useEffect(() => {
    if (!id || !hasRole(["admin", "board_member"])) return
    setAppsLoading(true)
    fetch(`/api/bff/projects/${id}/applications`)
      .then((r) => r.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setAppsLoading(false))
  }, [id, hasRole])

  const handleApplicationAction = async (appId: string, status: "approved" | "rejected") => {
    const res = await fetch(`/api/bff/projects/${id}/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)))
    }
  }

  const handleToggleRegistration = async (value: boolean) => {
    setRegToggling(true)
    try {
      const res = await fetch(`/api/bff/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationEnabled: value }),
      })
      if (res.ok) {
        setRegEnabled(value)
        setProject((prev) => prev ? { ...prev, registrationEnabled: value } : prev)
      }
    } catch {
      // revert on error
    } finally {
      setRegToggling(false)
    }
  }

  const applyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/apply/${id}`
    : `https://crm.gutenberg.ro/apply/${id}`

  const copyApplyUrl = () => {
    navigator.clipboard.writeText(applyUrl).then(() => {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg font-medium">Project not found</p>
        <Link href="/projects">
          <Button variant="outline" className="mt-4 rounded-xl">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  const canEdit = hasRole(["admin", "board_member"])
  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1)
  const typeLabel = TYPE_LABELS[project.projectType] ?? project.projectType

  const dateRange = (() => {
    if (!project.startDate && !project.endDate) return null
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    if (project.startDate && project.endDate)
      return `${fmt(project.startDate)} – ${fmt(project.endDate)}`
    if (project.startDate) return `From ${fmt(project.startDate)}`
    return `Until ${fmt(project.endDate!)}`
  })()

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Button>
        </Link>
        {canEdit && (
          <Button
            onClick={() => router.push(`/projects/create?edit=${project.id}`)}
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl bg-transparent"
          >
            <Edit className="h-4 w-4" />
            Edit Project
          </Button>
        )}
      </div>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden">
        {project.imageUrl ? (
          <div className="h-56 md:h-72">
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className={`h-40 bg-gradient-to-br from-violet-500 to-purple-700`} />
        )}
        <div className={`${project.imageUrl ? "absolute bottom-0 left-0 right-0 p-6 text-white" : "p-6"}`}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={`border text-xs ${project.imageUrl ? "bg-white/20 text-white border-white/30" : STATUS_COLORS[project.status] ?? "bg-gray-100 text-gray-600"}`}>
              {statusLabel}
            </Badge>
            <Badge className={`border text-xs ${project.imageUrl ? "bg-white/20 text-white border-white/30" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
              {typeLabel}
            </Badge>
            {project.scale && (
              <Badge className={`border text-xs ${project.imageUrl ? "bg-white/20 text-white border-white/30" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                {SCALE_LABELS[project.scale] ?? project.scale}
              </Badge>
            )}
            {project.visibility === "public" ? (
              <Badge className={`border text-xs gap-1 ${project.imageUrl ? "bg-white/20 text-white border-white/30" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                <Globe className="h-3 w-3" /> Public
              </Badge>
            ) : (
              <Badge className={`border text-xs gap-1 ${project.imageUrl ? "bg-white/20 text-white border-white/30" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                <Lock className="h-3 w-3" /> Internal
              </Badge>
            )}
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${project.imageUrl ? "text-white" : "text-gray-900"}`}>
            {project.title}
          </h1>
          <p className={`mt-1 text-sm md:text-base ${project.imageUrl ? "text-white/80" : "text-gray-500"}`}>
            {project.shortDescription}
          </p>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dateRange && (
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 px-4 py-3">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="truncate">{dateRange}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 px-4 py-3">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="truncate">{project.location}</span>
        </div>
        {project.expectedParticipants && (
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 px-4 py-3">
            <Users className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{project.expectedParticipants} expected</span>
          </div>
        )}
        {project.pointsReward > 0 && (
          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 rounded-xl border border-yellow-200 px-4 py-3">
            <Award className="h-4 w-4 shrink-0" />
            <span>{project.pointsReward} pts reward</span>
          </div>
        )}
        {linkedTasksCount > 0 && (
          <Link href={`/tasks?projectId=${project.id}`} className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 rounded-xl border border-purple-200 px-4 py-3 hover:bg-purple-100 transition-colors">
            <ClipboardList className="h-4 w-4 shrink-0" />
            <span>{linkedTasksCount} task{linkedTasksCount !== 1 ? "s" : ""}</span>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="rounded-xl bg-gray-100">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg">Team</TabsTrigger>
          <TabsTrigger value="goals" className="rounded-lg">Goals & KPIs</TabsTrigger>
          {canEdit && (
            <TabsTrigger value="applications" className="rounded-lg gap-1.5">
              Applications
              {applications.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-semibold">
                  {applications.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* OVERVIEW tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">About this Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{project.longDescription}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Row icon={<Flag className="h-4 w-4" />} label="Type" value={typeLabel} />
                {project.category && (
                  <Row icon={<BarChart3 className="h-4 w-4" />} label="Category" value={CATEGORY_LABELS[project.category] ?? project.category} />
                )}
                {project.scale && (
                  <Row icon={<Globe className="h-4 w-4" />} label="Scale" value={SCALE_LABELS[project.scale] ?? project.scale} />
                )}
                {project.funding && (
                  <Row icon={<Wallet className="h-4 w-4" />} label="Funding" value={FUNDING_LABELS[project.funding] ?? project.funding} />
                )}
                {project.budget && (
                  <Row icon={<Wallet className="h-4 w-4" />} label="Budget"
                    value={`${project.budget.toLocaleString()} ${project.currency ?? "EUR"}`} />
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Row icon={<MapPin className="h-4 w-4" />} label="Location" value={project.location} />
                {project.maxParticipants && (
                  <Row icon={<Users className="h-4 w-4" />} label="Max Participants" value={String(project.maxParticipants)} />
                )}
                {project.registrationLink && (
                  <div className="flex items-start gap-3 text-sm">
                    <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Registration</p>
                      <a
                        href={project.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline break-all"
                      >
                        {project.registrationLink}
                      </a>
                    </div>
                  </div>
                )}
                {project.partnerOrganizations && project.partnerOrganizations.length > 0 && (
                  <div className="flex items-start gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Partner Organizations</p>
                      <div className="flex flex-wrap gap-1">
                        {project.partnerOrganizations.map((p, i) => (
                          <Badge key={i} variant="outline" className="text-xs rounded-lg">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TEAM tab */}
        <TabsContent value="team" className="mt-4 space-y-4">
          {manager && (
            <Card className="rounded-2xl border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Project Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/members/${manager.id}`} className="flex items-center gap-3 group">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(manager.id)} text-white text-sm`}>
                      {memberInitials(manager)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm group-hover:text-purple-600 transition-colors">
                      {memberDisplayName(manager)}
                    </p>
                    <p className="text-xs text-gray-500">{manager.role} · {manager.department}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Team Members
                <span className="ml-2 text-sm font-normal text-gray-400">({memberUsers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memberUsers.length === 0 ? (
                <p className="text-sm text-gray-500">No team members assigned yet.</p>
              ) : (
                <div className="divide-y">
                  {memberUsers.map((m) => {
                    const membership = project.members?.find((pm) => pm.userId === m.id)
                    return (
                      <Link
                        key={m.id}
                        href={`/members/${m.id}`}
                        className="flex items-center gap-3 py-3 group"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(m.id)} text-white text-xs`}>
                            {memberInitials(m)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium group-hover:text-purple-600 transition-colors truncate">
                            {memberDisplayName(m)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{m.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {membership?.role && (
                            <Badge variant="outline" className="text-xs rounded-lg capitalize">
                              {membership.role}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs rounded-lg capitalize">
                            {m.department}
                          </Badge>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GOALS tab */}
        <TabsContent value="goals" className="mt-4 space-y-4">
          {project.goals && project.goals.length > 0 && (
            <Card className="rounded-2xl border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Project Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.goals.map((g, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-semibold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-gray-700">{g}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {project.kpis && project.kpis.length > 0 && (
            <Card className="rounded-2xl border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  KPIs / Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.kpis.map((k, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-semibold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-gray-700">{k}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(!project.goals?.length && !project.kpis?.length) && (
            <div className="text-center py-12 text-gray-500">
              <Target className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No goals or KPIs defined yet.</p>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-xl bg-transparent"
                  onClick={() => router.push(`/projects/create?edit=${project.id}`)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Add Goals
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* APPLICATIONS tab — admin/board_member only */}
        {canEdit && (
          <TabsContent value="applications" className="mt-4 space-y-4">

            {/* Registration status card */}
            <Card className="rounded-2xl border-gray-200">
              <CardContent className="pt-5 space-y-4">
                {/* Toggle row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-gray-900">Applications</p>
                      <Badge
                        className={`text-xs border pointer-events-none select-none ${
                          regEnabled
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {regEnabled ? "Open" : "Closed"}
                      </Badge>
                      {project.applicationFee != null && (
                        <Badge className="text-xs border bg-purple-50 text-purple-700 border-purple-200 pointer-events-none select-none">
                          {project.applicationFee === 0
                            ? "Free"
                            : `€${(project.applicationFee / 100).toFixed(2)}`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {regEnabled
                        ? "The public form is live. New applications can be submitted."
                        : "The public form is hidden. No new applications will be accepted."}
                    </p>
                  </div>

                  {project.applicationFee != null ? (
                    <Switch
                      checked={regEnabled}
                      onCheckedChange={handleToggleRegistration}
                      disabled={regToggling}
                      className="data-[state=checked]:bg-green-500"
                    />
                  ) : (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-amber-600 font-medium">Fee not set</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs text-purple-600 p-0 h-auto"
                        onClick={() => router.push(`/projects/create?edit=${project.id}`)}
                      >
                        Configure in Edit Project →
                      </Button>
                    </div>
                  )}
                </div>

                {/* Apply URL */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" /> Public application link
                  </p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <span className="flex-1 font-mono text-sm text-gray-600 truncate">{applyUrl}</span>
                    <button
                      onClick={copyApplyUrl}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded flex-shrink-0"
                    >
                      {copiedUrl ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications table */}
            <Card className="rounded-2xl border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Applications
                  <span className="ml-2 text-sm font-normal text-gray-400">({applications.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  </div>
                ) : applications.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No applications yet.</p>
                ) : (
                  <div className="divide-y">
                    {applications.map((app) => (
                      <div key={app.id} className="py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {app.firstName} {app.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{app.email}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(app.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            className={`text-xs border ${
                              app.paymentStatus === "paid"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : app.paymentStatus === "pending"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {app.paymentStatus === "free" ? "Free" : app.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </Badge>
                          <Badge
                            className={`text-xs border ${
                              app.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : app.status === "rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                          {app.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 rounded-lg text-xs text-green-700 border-green-200 hover:bg-green-50 gap-1"
                                onClick={() => handleApplicationAction(app.id, "approved")}
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 rounded-lg text-xs text-red-700 border-red-200 hover:bg-red-50 gap-1"
                                onClick={() => handleApplicationAction(app.id, "rejected")}
                              >
                                <UserX className="h-3.5 w-3.5" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}
