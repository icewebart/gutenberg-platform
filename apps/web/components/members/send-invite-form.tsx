"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMultiTenant } from "../multi-tenant-context"
import { useAuth } from "../auth-context"
import { useToast } from "@/hooks/use-toast"
import { Mail, Loader2, Copy, Check } from "lucide-react"

export function SendInviteForm() {
  const { currentOrganization, netzwerkCities } = useMultiTenant()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("volunteer")
  const [netzwerkCityId, setNetzwerkCityId] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setInvitationLink(null)

    try {
      const res = await fetch("/api/bff/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role,
          organizationId: currentOrganization.id,
          netzwerkCityId: netzwerkCityId && netzwerkCityId !== "none" ? netzwerkCityId : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const link = `${window.location.origin}/invite/${data.token}`
        setInvitationLink(link)
        toast({
          title: "Invitation Sent!",
          description: `An invitation email has been sent to ${email}.`,
        })
        setEmail("")
        setRole("volunteer")
        setNetzwerkCityId("")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send invitation",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: "Copied!", description: "Invitation link copied to clipboard" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Email Invitation
        </CardTitle>
        <CardDescription>
          Invite new members to join {currentOrganization.name}. They will receive an email with a signup link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                  {user?.role === "admin" && <SelectItem value="board_member">Board Member</SelectItem>}
                  {user?.role === "admin" && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Netzwerk City (optional)</Label>
              <Select value={netzwerkCityId} onValueChange={setNetzwerkCityId}>
                <SelectTrigger>
                  <SelectValue placeholder="None — main org" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None — Main Organization</SelectItem>
                  {netzwerkCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {invitationLink && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
              <Label className="text-green-800 font-medium">Invitation Link Created:</Label>
              <div className="flex gap-2">
                <Input value={invitationLink} readOnly className="bg-white text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-green-700">
                An invitation email has been sent. You can also share this link directly.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
