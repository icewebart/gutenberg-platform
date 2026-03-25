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
import { UserPlus, Loader2 } from "lucide-react"

export function CreateMemberForm() {
  const { currentOrganization, netzwerkCities } = useMultiTenant()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Controlled form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("volunteer")
  const [department, setDepartment] = useState("None")
  const [netzwerkCityId, setNetzwerkCityId] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }
    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" })
      return
    }
    setLoading(true)

    try {
      const res = await fetch("/api/bff/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim().toLowerCase(),
          password,
          role,
          department: department !== "None" ? department : undefined,
          organizationId: currentOrganization.id,
          netzwerkCityId: netzwerkCityId && netzwerkCityId !== "none" ? netzwerkCityId : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({ title: "Member Created!", description: `${name} has been added to ${currentOrganization.name}.` })
        setName(""); setEmail(""); setPassword(""); setConfirmPassword("")
        setRole("volunteer"); setDepartment("None"); setNetzwerkCityId("")
      } else {
        toast({ title: "Error", description: data.error || "Failed to create member", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
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
              <Input id="manual-name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-email">Email Address</Label>
              <Input id="manual-email" type="email" placeholder="john@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manual-password">Password</Label>
              <Input
                id="manual-password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-confirm">Confirm Password</Label>
              <Input
                id="manual-confirm"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
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
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
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
            <Label>Netzwerk City (optional)</Label>
            <Select value={netzwerkCityId} onValueChange={setNetzwerkCityId}>
              <SelectTrigger>
                <SelectValue placeholder="None — Main Organization" />
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
