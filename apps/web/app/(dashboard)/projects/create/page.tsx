"use client"

export const runtime = "edge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, X, Loader2, ImageIcon, Globe, Lock } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-context"
import { useMultiTenant } from "@/components/multi-tenant-context"
import { getAvatarGradient } from "@/lib/avatar-gradient"

interface Member {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  role: string
  department: string
}

const PROJECT_TYPES = [
  { value: "camp", label: "Camp" },
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "online", label: "Online Event" },
  { value: "training", label: "Training" },
  { value: "study_visit", label: "Study Visit" },
  { value: "youth_exchange", label: "Youth Exchange" },
  { value: "other", label: "Other" },
]

const PROJECT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const CATEGORIES = [
  { value: "education", label: "Education" },
  { value: "culture", label: "Culture" },
  { value: "environment", label: "Environment" },
  { value: "social", label: "Social" },
  { value: "sport", label: "Sport" },
  { value: "other", label: "Other" },
]

const SCALES = [
  { value: "local", label: "Local" },
  { value: "national", label: "National" },
  { value: "european", label: "European" },
  { value: "international", label: "International" },
]

const FUNDING = [
  { value: "self_funded", label: "Self-funded" },
  { value: "erasmus_plus", label: "Erasmus+" },
  { value: "national_grant", label: "National Grant" },
  { value: "sponsored", label: "Sponsored" },
  { value: "other", label: "Other" },
]

const CURRENCIES = ["EUR", "RON", "USD", "GBP", "CHF"]

function memberDisplayName(m: Member) {
  if (m.firstName || m.lastName) return `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
  return m.name
}

function memberInitials(m: Member) {
  const n = memberDisplayName(m)
  const parts = n.split(" ")
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : n.slice(0, 2).toUpperCase()
}

export default function CreateProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentOrganization } = useMultiTenant()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [memberSearch, setMemberSearch] = useState("")

  // Form fields
  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [status, setStatus] = useState("draft")
  const [visibility, setVisibility] = useState("internal")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [location, setLocation] = useState("")
  const [scale, setScale] = useState("local")
  const [projectType, setProjectType] = useState("workshop")
  const [category, setCategory] = useState("education")
  const [funding, setFunding] = useState("self_funded")
  const [projectManagerId, setProjectManagerId] = useState("")
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [maxParticipants, setMaxParticipants] = useState("")
  const [expectedParticipants, setExpectedParticipants] = useState("")
  const [pointsReward, setPointsReward] = useState("0")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("EUR")
  const [registrationLink, setRegistrationLink] = useState("")

  // Dynamic lists
  const [goals, setGoals] = useState([""])
  const [kpis, setKpis] = useState([""])
  const [partnerOrgs, setPartnerOrgs] = useState([""])

  // Load members for selectors
  useEffect(() => {
    if (!currentOrganization?.id) return
    const params = new URLSearchParams()
    if (user?.role === "board_member") params.set("organizationId", currentOrganization.id)
    fetch(`/api/bff/users?${params}`)
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [currentOrganization?.id, user?.role])

  const filteredMembers = members.filter((m) =>
    memberDisplayName(m).toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const updateList = (
    list: string[],
    setList: (v: string[]) => void,
    idx: number,
    value: string
  ) => {
    const next = [...list]
    next[idx] = value
    setList(next)
  }

  const addListItem = (list: string[], setList: (v: string[]) => void) =>
    setList([...list, ""])

  const removeListItem = (list: string[], setList: (v: string[]) => void, idx: number) =>
    setList(list.filter((_, i) => i !== idx))

  const handleSave = async () => {
    if (!title || !shortDescription || !longDescription || !location) {
      setError("Please fill in all required fields (Title, Descriptions, Location).")
      return
    }
    setSaving(true)
    setError("")
    try {
      const payload: Record<string, unknown> = {
        title,
        shortDescription,
        longDescription,
        imageUrl: imageUrl || undefined,
        status,
        visibility,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        projectDate: startDate || new Date().toISOString().split("T")[0],
        location,
        scale,
        projectType,
        category,
        funding,
        projectManagerId: projectManagerId || undefined,
        memberIds: memberIds.length ? memberIds : undefined,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        expectedParticipants: expectedParticipants ? parseInt(expectedParticipants) : undefined,
        pointsReward: parseInt(pointsReward) || 0,
        budget: budget ? parseInt(budget) : undefined,
        currency,
        registrationLink: registrationLink || undefined,
        goals: goals.filter(Boolean),
        kpis: kpis.filter(Boolean),
        partnerOrganizations: partnerOrgs.filter(Boolean),
        organizationId: currentOrganization.id,
      }

      const res = await fetch("/api/bff/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err?.error || "Failed to create project.")
        return
      }

      const project = await res.json()
      router.push(`/projects/${project.id}`)
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setSaving(false)
    }
  }

  if (!user || !currentOrganization) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              Projects
            </Button>
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-semibold text-gray-900">New Project</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/projects">
            <Button variant="outline" className="rounded-xl bg-transparent">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save Project"}
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — main form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1 — Basic Info */}
          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Project Name <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. Sommerschule 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="short" className="text-sm font-medium">Short Description <span className="text-red-500">*</span></Label>
                <Input
                  id="short"
                  placeholder="One sentence that summarises the project"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="long" className="text-sm font-medium">Full Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="long"
                  placeholder="Describe the project in detail — goals, program, target audience…"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={5}
                  className="mt-1 rounded-xl resize-none"
                />
              </div>
              <div>
                <Label htmlFor="image" className="text-sm font-medium">Cover Image URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="image"
                    placeholder="https://…"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-2 relative h-40 rounded-xl overflow-hidden border border-gray-200">
                    <img src={imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {!imageUrl && (
                  <div className="mt-2 h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Image preview will appear here
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2 — Dates & Location */}
          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Dates & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start" className="text-sm font-medium">Start Date</Label>
                  <Input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="end" className="text-sm font-medium">End Date</Label>
                  <Input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Location / City <span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  placeholder="e.g. Berlin, Germany"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Project Scale</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SCALES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setScale(s.value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        scale === s.value
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="reglink" className="text-sm font-medium">Registration Link</Label>
                <Input
                  id="reglink"
                  placeholder="https://… (external registration page)"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3 — Classification */}
          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Project Type</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setProjectType(t.value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        projectType === t.value
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        category === c.value
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Funding / Program</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FUNDING.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFunding(f.value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        funding === f.value
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 — Team */}
          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Team & Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Project Manager</Label>
                <Select value={projectManagerId} onValueChange={setProjectManagerId}>
                  <SelectTrigger className="mt-1 rounded-xl">
                    <SelectValue placeholder="Select a project manager…" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {memberDisplayName(m)} — {m.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Team Members</Label>
                <Input
                  placeholder="Search members…"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="mt-1 mb-2 rounded-xl"
                />
                {memberIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {memberIds.map((id) => {
                      const m = members.find((x) => x.id === id)
                      if (!m) return null
                      return (
                        <Badge key={id} variant="secondary" className="gap-1 rounded-lg pl-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className={`text-[8px] bg-gradient-to-br ${getAvatarGradient(m.id)} text-white`}>
                              {memberInitials(m)}
                            </AvatarFallback>
                          </Avatar>
                          {memberDisplayName(m)}
                          <button type="button" onClick={() => toggleMember(id)}>
                            <X className="h-3 w-3 ml-0.5" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y">
                  {filteredMembers.slice(0, 20).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMember(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                        memberIds.includes(m.id) ? "bg-purple-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className={`text-xs bg-gradient-to-br ${getAvatarGradient(m.id)} text-white`}>
                          {memberInitials(m)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{memberDisplayName(m)}</p>
                        <p className="text-gray-500 text-xs truncate">{m.email}</p>
                      </div>
                      {memberIds.includes(m.id) && (
                        <span className="text-purple-600 text-xs font-medium">Added</span>
                      )}
                    </button>
                  ))}
                  {filteredMembers.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">No members found</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expected" className="text-sm font-medium">Expected Participants</Label>
                  <Input
                    id="expected"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={expectedParticipants}
                    onChange={(e) => setExpectedParticipants(e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="maxp" className="text-sm font-medium">Max Participants</Label>
                  <Input
                    id="maxp"
                    type="number"
                    min="1"
                    placeholder="0 = unlimited"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 — Goals & KPIs */}
          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Goals & KPIs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Project Goals</Label>
                <p className="text-xs text-gray-500 mb-2">What does this project aim to achieve?</p>
                <div className="space-y-2">
                  {goals.map((g, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder={`Goal ${i + 1}…`}
                        value={g}
                        onChange={(e) => updateList(goals, setGoals, i, e.target.value)}
                        className="rounded-xl"
                      />
                      {goals.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="rounded-xl shrink-0"
                          onClick={() => removeListItem(goals, setGoals, i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2 rounded-xl gap-1 bg-transparent"
                  onClick={() => addListItem(goals, setGoals)}>
                  <Plus className="h-3.5 w-3.5" /> Add Goal
                </Button>
              </div>

              <div>
                <Label className="text-sm font-medium">KPIs / Success Metrics</Label>
                <p className="text-xs text-gray-500 mb-2">How will you measure success?</p>
                <div className="space-y-2">
                  {kpis.map((k, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder={`e.g. 50 participants, 3 workshops delivered…`}
                        value={k}
                        onChange={(e) => updateList(kpis, setKpis, i, e.target.value)}
                        className="rounded-xl"
                      />
                      {kpis.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="rounded-xl shrink-0"
                          onClick={() => removeListItem(kpis, setKpis, i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2 rounded-xl gap-1 bg-transparent"
                  onClick={() => addListItem(kpis, setKpis)}>
                  <Plus className="h-3.5 w-3.5" /> Add KPI
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 — Logistics */}
          <Card className="rounded-2xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="budget" className="text-sm font-medium">Planned Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Partner Organizations</Label>
                <p className="text-xs text-gray-500 mb-2">Other organisations collaborating on this project</p>
                <div className="space-y-2">
                  {partnerOrgs.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder="Organization name…"
                        value={p}
                        onChange={(e) => updateList(partnerOrgs, setPartnerOrgs, i, e.target.value)}
                        className="rounded-xl"
                      />
                      {partnerOrgs.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="rounded-xl shrink-0"
                          onClick={() => removeListItem(partnerOrgs, setPartnerOrgs, i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2 rounded-xl gap-1 bg-transparent"
                  onClick={() => addListItem(partnerOrgs, setPartnerOrgs)}>
                  <Plus className="h-3.5 w-3.5" /> Add Partner
                </Button>
              </div>

              <div>
                <Label htmlFor="points" className="text-sm font-medium">Points Reward</Label>
                <p className="text-xs text-gray-500">Points awarded to members who complete this project</p>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={pointsReward}
                  onChange={(e) => setPointsReward(e.target.value)}
                  className="mt-1 rounded-xl w-32"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT sidebar */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-gray-200 sticky top-20">
            <CardContent className="pt-5 space-y-5">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Visibility</Label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setVisibility("internal")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm border transition-all ${
                      visibility === "internal"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" /> Internal
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm border transition-all ${
                      visibility === "public"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" /> Public
                  </button>
                </div>
              </div>

              {(startDate || endDate) && (
                <div className="text-sm text-gray-600 space-y-1 border-t pt-4">
                  {startDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Start</span>
                      <span className="font-medium">{new Date(startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  )}
                  {endDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">End</span>
                      <span className="font-medium">{new Date(endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  )}
                  {startDate && endDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)} days
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : "Save Project"}
                </Button>
                <Link href="/projects">
                  <Button variant="ghost" className="w-full mt-2 rounded-xl">Cancel</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
