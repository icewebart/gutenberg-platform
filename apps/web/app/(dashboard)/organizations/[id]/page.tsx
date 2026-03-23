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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft, Building2, Globe, Loader2, Save, Users, MapPin, Plus, Trash2
} from "lucide-react"
import Link from "next/link"

interface Org {
  id: string
  name: string
  domain: string
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
  gamification?: { points: number }
}

interface City {
  id: string
  name: string
  country: string
  organizationId: string
}

const ROLES = ["admin", "board_member", "volunteer", "participant"]

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { hasRole } = useAuth()
  const isAdmin = hasRole("admin")

  const [org, setOrg] = useState<Org | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editDomain, setEditDomain] = useState("")
  const [editAllowReg, setEditAllowReg] = useState(true)
  const [editRequireApproval, setEditRequireApproval] = useState(false)
  const [editDefaultRole, setEditDefaultRole] = useState("volunteer")

  // City dialog
  const [cityDialogOpen, setCityDialogOpen] = useState(false)
  const [cityForm, setCityForm] = useState({ name: "", country: "" })
  const [cityCreating, setCityCreating] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orgRes, membersRes, citiesRes] = await Promise.all([
          fetch(`/api/bff/organizations/${id}`),
          fetch(`/api/bff/users?organizationId=${id}`),
          fetch(`/api/bff/organizations/${id}/cities`),
        ])
        if (orgRes.ok) {
          const data = await orgRes.json()
          setOrg(data)
          setEditName(data.name)
          setEditDomain(data.domain)
          setEditAllowReg(data.settings?.allowRegistration ?? true)
          setEditRequireApproval(data.settings?.requireApproval ?? false)
          setEditDefaultRole(data.settings?.defaultRole ?? "volunteer")
        }
        if (membersRes.ok) setMembers(await membersRes.json())
        if (citiesRes.ok) setCities(await citiesRes.json())
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
          settings: {
            allowRegistration: editAllowReg,
            requireApproval: editRequireApproval,
            defaultRole: editDefaultRole,
          },
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

  const handleAddCity = async () => {
    if (!cityForm.name || !cityForm.country) return
    setCityCreating(true)
    try {
      const res = await fetch(`/api/bff/organizations/${id}/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cityForm),
      })
      if (res.ok) {
        const city = await res.json()
        setCities((prev) => [...prev, city])
        setCityDialogOpen(false)
        setCityForm({ name: "", country: "" })
      }
    } finally {
      setCityCreating(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/organizations")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Organizations
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-box bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="title-page">{org.name}</h1>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Globe className="h-3.5 w-3.5" />
            {org.domain}
          </div>
        </div>
        <div className="ml-auto flex gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{members.length} members</span>
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{cities.length} cities</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-field">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="cities">Cities ({cities.length})</TabsTrigger>
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
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Allow Registration</span>
                  <button
                    disabled={!isAdmin}
                    onClick={() => setEditAllowReg(!editAllowReg)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${editAllowReg ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editAllowReg ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Require Approval</span>
                  <button
                    disabled={!isAdmin}
                    onClick={() => setEditRequireApproval(!editRequireApproval)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${editRequireApproval ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editRequireApproval ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
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
            <CardHeader className="flex flex-row items-center justify-between">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cities ── */}
        <TabsContent value="cities" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="title-section">Netzwerk Cities</CardTitle>
              <Dialog open={cityDialogOpen} onOpenChange={setCityDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add City</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Netzwerk City</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label>City Name</Label>
                      <Input className="rounded-field" placeholder="Berlin" value={cityForm.name} onChange={(e) => setCityForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Country</Label>
                      <Input className="rounded-field" placeholder="Germany" value={cityForm.country} onChange={(e) => setCityForm((f) => ({ ...f, country: e.target.value }))} />
                    </div>
                    <Button onClick={handleAddCity} disabled={cityCreating} className="w-full btn-primary">
                      {cityCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add City
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {cities.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No cities yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cities.map((city) => (
                    <div key={city.id} className="flex items-center gap-3 p-3 rounded-field border bg-gray-50">
                      <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{city.name}</p>
                        <p className="text-xs text-gray-500">{city.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
