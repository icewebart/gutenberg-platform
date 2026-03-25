"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useMultiTenant } from "../multi-tenant-context"
import { Mail, X, Loader2, Clock } from "lucide-react"

interface Invitation {
  id: string
  email: string
  role: string
  token: string
  usedAt?: string | null
  expiresAt: string
  createdAt: string
}

export function InvitationsList() {
  const { toast } = useToast()
  const { currentOrganization } = useMultiTenant()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/bff/invitations?organizationId=${currentOrganization.id}`)
      if (res.ok) {
        const data = await res.json()
        // Only show pending (not yet used)
        setInvitations(data.filter((inv: Invitation) => !inv.usedAt))
      }
    } catch {
      console.error("Failed to fetch invitations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentOrganization?.id) fetchInvitations()
  }, [currentOrganization?.id])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      const res = await fetch(`/api/bff/invitations/${id}`, { method: "DELETE" })
      if (res.ok || res.status === 204) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== id))
        toast({ title: "Invitation cancelled", description: "The invitation has been removed." })
      } else {
        toast({ title: "Error", description: "Failed to cancel invitation", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setCancellingId(null)
    }
  }

  const isExpired = (expiresAt: string) => new Date() > new Date(expiresAt)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

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
        <CardDescription>Manage outstanding invitations for {currentOrganization.name}</CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No pending invitations</p>
            <p className="text-sm mt-1">Send an invitation from the Invite tab</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv) => {
                const expired = isExpired(inv.expiresAt)
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell className="capitalize">
                      <Badge variant="outline">{inv.role.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(inv.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className={`h-3.5 w-3.5 ${expired ? "text-red-400" : "text-yellow-500"}`} />
                        <span className={expired ? "text-red-500" : "text-gray-600"}>
                          {expired ? "Expired" : formatDate(inv.expiresAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(inv.id)}
                        disabled={cancellingId === inv.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {cancellingId === inv.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <X className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
