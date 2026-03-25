"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMultiTenant } from "../multi-tenant-context"
import { useAuth } from "../auth-context"
import { useToast } from "@/hooks/use-toast"
import { Mail, Loader2, Copy, Check } from "lucide-react"

interface Org { id: string; name: string }

export function SendInviteForm() {
  const { currentOrganization } = useMultiTenant()
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === "admin"

  const [loading, setLoading] = useState(false)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [orgs, setOrgs] = useState<Org[]>([])

  const [email, setEmail] = useState("")
  const [role, setRole] = useState("volunteer")
  const [organizationId, setOrganizationId] = useState(currentOrganization?.id ?? "")

  // Admins: load all orgs so they can pick which one to invite to
  useEffect(() => {
    if (!isAdmin) return
    fetch("/api/bff/organizations")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setOrgs(data) : [])
      .catch(() => {})
  }, [isAdmin])

  // Keep organizationId in sync if currentOrganization loads late
  useEffect(() => {
    if (currentOrganization?.id && !organizationId) {
      setOrganizationId(currentOrganization.id)
    }
  }, [currentOrganization?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !organizationId) return
    setLoading(true)
    setInvitationLink(null)

    try {
      const res = await fetch("/api/bff/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role,
          organizationId,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const link = `${window.location.origin}/invite/${data.token}`
        setInvitationLink(link)
        toast({ title: "Invitation Sent!", description: `Invitation email sent to ${email}.` })
        setEmail("")
        setRole("volunteer")
      } else {
        toast({ title: "Error", description: data.error || "Failed to send invitation", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!invitationLink) return
    navigator.clipboard.writeText(invitationLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copied!", description: "Invitation link copied to clipboard" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Email Invitation
        </CardTitle>
        <CardDescription>
          The invited person will receive an email with a link to create their account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Organisation — only admins can pick */}
          {isAdmin && orgs.length > 0 && (
            <div className="space-y-2">
              <Label>Organisation</Label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organisation" />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="inv-email">Email Address</Label>
            <Input
              id="inv-email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
                {isAdmin && <SelectItem value="board_member">Board Member</SelectItem>}
                {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {invitationLink && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
              <Label className="text-green-800 font-medium">Invitation link ready:</Label>
              <div className="flex gap-2">
                <Input value={invitationLink} readOnly className="bg-white text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-green-700">Email sent. You can also share this link directly.</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !organizationId}>
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
              : <><Mail className="mr-2 h-4 w-4" />Send Invitation</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
