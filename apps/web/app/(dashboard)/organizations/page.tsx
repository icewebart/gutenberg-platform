"use client"

export const runtime = "edge"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Plus, Loader2, ArrowRight, GraduationCap, Network } from "lucide-react"
import { cn } from "@/lib/utils"

interface Org {
  id: string
  name: string
  type: string
  settings: { allowRegistration: boolean; requireApproval: boolean; defaultRole: string }
  createdAt: string
}

const ORG_TYPES = [
  {
    value: "student_organization",
    label: "Student Organization",
    icon: GraduationCap,
    desc: "A student-led organization or university group",
  },
  {
    value: "netzwerk_organization",
    label: "Netzwerk Organization",
    icon: Network,
    desc: "A city or regional Netzwerk hub",
  },
]

export default function OrganizationsPage() {
  const router = useRouter()
  const { hasRole } = useAuth()
  const isAdmin = hasRole("admin")
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: "", type: "student_organization" })
  const [error, setError] = useState("")

  useEffect(() => { fetchOrgs() }, [])

  const fetchOrgs = async () => {
    try {
      const res = await fetch("/api/bff/organizations")
      if (res.ok) setOrgs(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.name) { setError("Name is required."); return }
    setCreating(true); setError("")
    try {
      const res = await fetch("/api/bff/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const newOrg = await res.json()
        setOrgs((prev) => [...prev, newOrg])
        setDialogOpen(false)
        setForm({ name: "", type: "student_organization" })
      } else {
        const data = await res.json()
        setError(data.error || "Failed to create organization.")
      }
    } finally {
      setCreating(false)
    }
  }

  const getTypeConfig = (type: string) => ORG_TYPES.find((t) => t.value === type) ?? ORG_TYPES[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="title-page">Organizations</h1>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />New Organization</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    className="rounded-field"
                    placeholder="Gutenberg Platform"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organization Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ORG_TYPES.map((t) => {
                      const Icon = t.icon
                      const selected = form.type === t.value
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-box border-2 text-center transition-all",
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
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={handleCreate} disabled={creating} className="w-full btn-primary">
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Organization
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-24 text-gray-500">No organizations found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orgs.map((org) => {
            const typeConfig = getTypeConfig(org.type)
            const TypeIcon = typeConfig.icon
            return (
              <button
                key={org.id}
                onClick={() => router.push(`/organizations/${org.id}`)}
                className="text-left rounded-box border bg-white p-6 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors mt-1" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{org.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <TypeIcon className="h-3 w-3" />
                    {typeConfig.label}
                  </Badge>
                  {org.settings?.allowRegistration && (
                    <Badge variant="outline" className="text-xs">Open registration</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Created {new Date(org.createdAt).toLocaleDateString()}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
