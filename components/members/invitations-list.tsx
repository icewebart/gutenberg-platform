"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { cancelInvitationAction, resendInvitationAction } from "@/app/actions/invitations"
import { Mail, X, RefreshCw, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Invitation {
  id: string
  email: string
  name?: string
  role: string
  status: string
  createdAt: string
  expiresAt: string
}

export function InvitationsList() {
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, fetch invitations from the server
    // For now, we'll use mock data
    setLoading(false)
    setInvitations([])
  }, [])

  const handleCancel = async (invitationId: string) => {
    setActionLoading(invitationId)
    try {
      const result = await cancelInvitationAction(invitationId)
      if (result.success) {
        toast({
          title: "Invitation Cancelled",
          description: "The invitation has been cancelled.",
        })
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel invitation",
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
      setActionLoading(null)
    }
  }

  const handleResend = async (invitationId: string) => {
    setActionLoading(invitationId)
    try {
      const result = await resendInvitationAction(invitationId)
      if (result.success) {
        toast({
          title: "Invitation Resent",
          description: "The invitation has been resent with a new expiration date.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend invitation",
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
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>Manage and track all pending member invitations</CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No pending invitations</p>
            <p className="text-sm mt-1">Send an invitation to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.name || "—"}</TableCell>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell className="capitalize">{invitation.role.replace("_", " ")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invitation.status === "pending"
                          ? "secondary"
                          : invitation.status === "accepted"
                            ? "default"
                            : "outline"
                      }
                    >
                      {invitation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResend(invitation.id)}
                        disabled={actionLoading === invitation.id}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancel(invitation.id)}
                        disabled={actionLoading === invitation.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
