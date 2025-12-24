"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMultiTenant } from "../multi-tenant-context"
import { useAuth } from "../auth-context"
import { useToast } from "@/hooks/use-toast"
import { sendInvitationAction } from "@/app/actions/invitations"
import { Mail, Loader2, Copy, Check } from "lucide-react"

export function SendInviteForm() {
  const { currentOrganization, netzwerkCities } = useMultiTenant()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setInvitationLink(null)

    const formData = new FormData(e.currentTarget)
    formData.append("organizationId", currentOrganization.id)

    try {
      const result = await sendInvitationAction(formData)

      if (result.success) {
        toast({
          title: "Invitation Sent!",
          description: "The invitation has been created and the link is ready to share.",
        })
        setInvitationLink(result.invitationLink || null)
        // @ts-ignore
        e.target.reset()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send invitation",
          variant: "destructive",
        })
      }
    } catch (error) {
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
      toast({
        title: "Copied!",
        description: "Invitation link copied to clipboard",
      })
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="volunteer" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                  {user?.role === "admin" && <SelectItem value="board_member">Board Member</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select name="department">
                <SelectTrigger>
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="PR">PR</SelectItem>
                  <SelectItem value="FR">FR</SelectItem>
                  <SelectItem value="AB">AB</SelectItem>
                  <SelectItem value="Board">Board</SelectItem>
                  <SelectItem value="Alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="netzwerkCityId">Netzwerk City (Optional)</Label>
            <Select name="netzwerkCityId">
              <SelectTrigger>
                <SelectValue placeholder="Select city (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - Main Organization</SelectItem>
                {netzwerkCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {invitationLink && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <Label className="text-green-800 font-medium">Invitation Link Created:</Label>
              <div className="flex gap-2">
                <Input value={invitationLink} readOnly className="bg-white" />
                <Button type="button" variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-green-700">Share this link with the invitee or send it via email.</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
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
