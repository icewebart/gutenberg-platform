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
import { Building2, Globe, Users, Plus, Loader2, ArrowRight } from "lucide-react"

interface Org {
  id: string
  name: string
  domain: string
  settings: { allowRegistration: boolean; requireApproval: boolean; defaultRole: string }
  createdAt: string
}

export default function OrganizationsPage() {
  const router = useRouter()
  const { hasRole } = useAuth()
  const isAdmin = hasRole("admin")
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: "", domain: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrgs()
  }, [])

  const fetchOrgs = async () => {
    try {
      const res = await fetch("/api/bff/organizations")
      if (res.ok) setOrgs(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.name || !form.domain) { setError("Name and domain are required."); return }
    setCreating(true); setError("")
    try {
      const res = await fetch("/api/bff/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, domain: form.domain }),
      })
      if (res.ok) {
        const org = await res.json()
        setOrgs((prev) => [...prev, org])
        setDialogOpen(false)
        setForm({ name: "", domain: "" })
      } else {
        const data = await res.json()
        setError(data.error || "Failed to create organization.")
      }
    } finally {
      setCreating(false)
    }
  }

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
                <div className="space-y-1">
                  <Label>Domain</Label>
                  <Input
                    className="rounded-field"
                    placeholder="gutenberg.org"
                    value={form.domain}
                    onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                  />
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
          {orgs.map((org) => (
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
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                <Globe className="h-3.5 w-3.5" />
                {org.domain}
              </div>
              <div className="flex flex-wrap gap-2">
                {org.settings?.allowRegistration && (
                  <Badge variant="outline" className="text-xs">Open registration</Badge>
                )}
                {org.settings?.requireApproval && (
                  <Badge variant="outline" className="text-xs">Requires approval</Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  Default: {org.settings?.defaultRole || "volunteer"}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Created {new Date(org.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
