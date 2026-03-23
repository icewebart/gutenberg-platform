"use client"

export const runtime = "edge"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Award, Mail, Building2, Loader2, Shield, CheckCircle, XCircle } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  role: string
  department: string
  isActive: boolean
  isVerified: boolean
  avatar?: string
  organizationId: string
  gamification?: { points: number; level: number; badges?: string[] }
  createdAt: string
  updatedAt: string
}

const ROLES = ["admin", "board_member", "volunteer", "participant"]
const DEPARTMENTS = ["HR", "PR", "FR", "AB", "Board", "Alumni", "None"]

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user: currentUser, hasRole } = useAuth()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editRole, setEditRole] = useState("")
  const [editDepartment, setEditDepartment] = useState("")
  const [editActive, setEditActive] = useState(true)

  const isAdmin = hasRole("admin")
  const isBoardMember = hasRole("board_member")
  const canEdit = isAdmin || isBoardMember

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/bff/users/${id}`)
        if (res.ok) {
          const data = await res.json()
          setMember(data)
          setEditRole(data.role)
          setEditDepartment(data.department)
          setEditActive(data.isActive)
        } else {
          setMember(null)
        }
      } catch {
        setMember(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMember()
  }, [id])

  const handleSave = async () => {
    if (!member) return
    setSaving(true)
    try {
      const res = await fetch(`/api/bff/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, department: editDepartment, isActive: editActive }),
      })
      if (res.ok) {
        const updated = await res.json()
        setMember(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/members")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Member not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const points = member.gamification?.points ?? 0
  const level = member.gamification?.level ?? 1
  const initials = member.name.split(" ").map((n) => n[0]).join("")

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/members")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
      </Button>

      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-blue-200">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="title-page">{member.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{member.role.replace("_", " ")}</Badge>
                <Badge variant="outline">{member.department}</Badge>
                <Badge className={member.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {member.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                {member.email}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1 text-2xl font-bold text-yellow-600">
                <Award className="h-6 w-6" />
                {points.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">points · level {level}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account info */}
        <Card>
          <CardHeader>
            <CardTitle className="title-section">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Verified
              </span>
              <Badge className={member.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {member.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Organization ID
              </span>
              <span className="text-sm font-mono text-gray-700">{member.organizationId.slice(0, 8)}…</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Member since</span>
              <span className="text-sm text-gray-700">{new Date(member.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Edit role / department (admin + board) */}
        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle className="title-section flex items-center gap-2">
                <Shield className="h-5 w-5" /> Edit Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Select value={editRole} onValueChange={setEditRole} disabled={!isAdmin}>
                  <SelectTrigger className="rounded-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isAdmin && <p className="text-xs text-gray-400">Only admins can change roles.</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <Select value={editDepartment} onValueChange={setEditDepartment}>
                  <SelectTrigger className="rounded-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Active</label>
                <button
                  onClick={() => setEditActive(!editActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editActive ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
