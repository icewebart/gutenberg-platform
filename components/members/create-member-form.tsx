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
import { createMemberManuallyAction } from "@/app/actions/invitations"
import { UserPlus, Loader2 } from "lucide-react"

export function CreateMemberForm() {
  const { currentOrganization, netzwerkCities } = useMultiTenant()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("organizationId", currentOrganization.id)

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const result = await createMemberManuallyAction(formData)

      if (result.success) {
        toast({
          title: "Member Created!",
          description: "The new member has been added successfully.",
        })
        // @ts-ignore
        e.target.reset()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create member",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create Member Manually
        </CardTitle>
        <CardDescription>
          Add a new member directly to {currentOrganization.name} with a password. They can log in immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manual-name">Full Name</Label>
              <Input id="manual-name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-email">Email Address</Label>
              <Input id="manual-email" name="email" type="email" placeholder="john@example.com" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manual-password">Password</Label>
              <Input
                id="manual-password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-confirmPassword">Confirm Password</Label>
              <Input
                id="manual-confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manual-role">Role</Label>
              <Select name="role" defaultValue="volunteer" required>
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
              <Label htmlFor="manual-department">Department</Label>
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
            <Label htmlFor="manual-netzwerkCityId">Netzwerk City (Optional)</Label>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
