"use client"

export const runtime = "edge"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Building2, Globe, Loader2, Save, Users, GraduationCap, Network } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getAvatarGradient } from "@/lib/avatar-gradient"

interface Org {
  id: string
  name: string
  domain: string
  type: string
  settings: { allowRegistration: boolean; requireApproval: boolean; defaultRole: string }
  createdAt: string
  updatedAt: string
}

interface Member {
  id: string
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
  avatar?: string
  createdAt: string
}

const ROLES = ["admin", "board_member", "volunteer", "participant"]

const ORG_TYPES = [
  { value: "student_organization", label: "Student Organization", icon: GraduationCap },
  { value: "netzwerk_organization", label: "Netzwerk Organization", icon: Network },
]

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { hasRole } = useAuth()
  const isAdmin = hasRole("admin")

  const [org, setOrg] = useState<Org | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editName, setEditName] = useState("")
  const [editDomain, setEditDomain] = useState("")
  const [editType, setEditType] = useState("student_organization")
  const [editAllowReg, setEditAllowReg] = useState(true)
  const [editRequireApproval, setEditRequireApproval] = useState(false)
  const [editDefaultRole, setEditDefaultRole] = useState("volunteer")

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orgRes, membersRes] = await Promise.all([
          fetch(`/api/bff/organizations/${id}`),
          fetch(`/api/bff/users?organizationId=${id}`),
        ])
        if (orgRes.ok) {
          const data = await orgRes.json()
          setOrg(data)
          setEditName(data.name)
          setEditDomain(data.domain)
          setEditType(data.type ?? "student_organization")
          setEditAllowReg(data.settings?.allowRegistration ?? true)
          setEditRequireApproval(data.settings?.requireApproval ?? false)
          setEditDefaultRole(data.settings?.defaultRole ?? "volunteer")
        }
        if (membersRes.ok) setMembers(await membersRes.json())
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  const handleSaveDetails = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/bff/organizations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          domain: editDomain,
          type: editType,
          settings: { allowRegistration: editAllowReg, requireApproval: editRequireApproval, defaultRole: editDefaultRole },
        }),
      })
      if (res.ok) setOrg(await res.json())
    } finally {
      setSaving(false)
    }
  }

  const handleChangeRole = async (memberId: string, role: string) => {
    const res = await fetch(`/api/bff/users/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: updated.role } : m)))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/organizations")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card><CardContent className="p-12 text-center text-gray-500">Organization not found.</CardContent></Card>
      </div>
    )
  }

  const typeConfig = ORG_TYPES.find((t) => t.value === org.type) ?? ORG_TYPES[0]
  const TypeIcon = typeConfig.icon

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/organizations")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Organizations
      </Button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-box bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="title-page">{org.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Globe className="h-3.5 w-3.5" />
            {org.domain}
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <TypeIcon className="h-3 w-3" />
              {typeConfig.label}
            </Badge>
          </div>
        </div>
        <div className="ml-auto text-sm text-gray-500 flex items-center gap-1">
          <Users className="h-4 w-4" />
          {members.length} members
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="rounded-field">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
        </TabsList>

        {/* ── Details ── */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="title-section">Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 max-w-lg">
              <div className="space-y-1">
                <Label>Organization Name</Label>
                <Input className="rounded-field" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!isAdmin} />
              </div>
              <div className="space-y-1">
                <Label>Domain</Label>
                <Input className="rounded-field" value={editDomain} onChange={(e) => setEditDomain(e.target.value)} disabled={!isAdmin} />
              </div>
              <div className="space-y-2">
                <Label>Organization Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ORG_TYPES.map((t) => {
                    const Icon = t.icon
                    const selected = editType === t.value
                    return (
                      <button
                        key={t.value}
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => setEditType(t.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-box border-2 text-center transition-all disabled:opacity-50",
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-medium leading-tight">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Default Role for New Members</Label>
                <Select value={editDefaultRole} onValueChange={setEditDefaultRole} disabled={!isAdmin}>
                  <SelectTrigger className="rounded-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Settings</Label>
                {[
                  { label: "Allow Registration", value: editAllowReg, set: setEditAllowReg },
                  { label: "Require Approval", value: editRequireApproval, set: setEditRequireApproval },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{label}</span>
                    <button
                      disabled={!isAdmin}
                      onClick={() => set(!value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${value ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <Button onClick={handleSaveDetails} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Members ── */}
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="title-section">Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {members.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No members in this organization.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(member.id)} text-white text-xs font-bold`}>
                                {member.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <Link href={`/members/${member.id}`} className="font-medium hover:underline text-sm">
                              {member.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-500">{member.email}</TableCell>
                        <TableCell>
                          {isAdmin ? (
                            <Select value={member.role} onValueChange={(r) => handleChangeRole(member.id, r)}>
                              <SelectTrigger className="rounded-field h-8 w-36 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((r) => (
                                  <SelectItem key={r} value={r} className="capitalize text-xs">{r.replace("_", " ")}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="capitalize text-xs">{member.role.replace("_", " ")}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={`text-xs ${member.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-gray-400">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
