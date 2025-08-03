"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-context"

interface Volunteer {
  id: string
  name: string
  email: string
  role: string
  department: string
  skills: string[]
  avatar?: string
  is_active: boolean
}

interface Project {
  id: string
  title: string
}

interface AssignVolunteersModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onAssignmentComplete: () => void
}

export function AssignVolunteersModal({ isOpen, onClose, project, onAssignmentComplete }: AssignVolunteersModalProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [assignedVolunteers, setAssignedVolunteers] = useState<Volunteer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchVolunteers()
      fetchAssignedVolunteers()
    }
  }, [isOpen, project.id])

  const fetchVolunteers = async () => {
    if (!user?.organization_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", user.organization_id)
        .eq("is_active", true)
        .in("role", ["volunteer", "participant"])
        .order("name")

      if (error) {
        console.error("Error fetching volunteers:", error)
        return
      }

      setVolunteers(data || [])
    } catch (error) {
      console.error("Error fetching volunteers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignedVolunteers = async () => {
    try {
      const { data, error } = await supabase
        .from("project_assignments")
        .select(`
          volunteer_id,
          profiles!inner(*)
        `)
        .eq("project_id", project.id)

      if (error) {
        console.error("Error fetching assigned volunteers:", error)
        return
      }

      const assigned = data?.map((assignment: any) => assignment.profiles) || []
      setAssignedVolunteers(assigned)
    } catch (error) {
      console.error("Error fetching assigned volunteers:", error)
    }
  }

  const assignVolunteer = async (volunteer: Volunteer) => {
    if (!user?.id) return

    setAssigning(true)
    try {
      const { error } = await supabase.from("project_assignments").insert({
        project_id: project.id,
        volunteer_id: volunteer.id,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        status: "active",
      })

      if (error) {
        console.error("Error assigning volunteer:", error)
        return
      }

      setAssignedVolunteers([...assignedVolunteers, volunteer])
      onAssignmentComplete()
    } catch (error) {
      console.error("Error assigning volunteer:", error)
    } finally {
      setAssigning(false)
    }
  }

  const unassignVolunteer = async (volunteer: Volunteer) => {
    setAssigning(true)
    try {
      const { error } = await supabase
        .from("project_assignments")
        .delete()
        .eq("project_id", project.id)
        .eq("volunteer_id", volunteer.id)

      if (error) {
        console.error("Error unassigning volunteer:", error)
        return
      }

      setAssignedVolunteers(assignedVolunteers.filter((v) => v.id !== volunteer.id))
      onAssignmentComplete()
    } catch (error) {
      console.error("Error unassigning volunteer:", error)
    } finally {
      setAssigning(false)
    }
  }

  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const availableVolunteers = filteredVolunteers.filter(
    (volunteer) => !assignedVolunteers.some((assigned) => assigned.id === volunteer.id),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Assign Volunteers to {project.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[60vh]">
          {/* Available Volunteers */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Available Volunteers</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-full space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading volunteers...</div>
              ) : availableVolunteers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No volunteers found matching your search." : "No available volunteers."}
                </div>
              ) : (
                availableVolunteers.map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={volunteer.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {volunteer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{volunteer.name}</div>
                        <div className="text-sm text-gray-500">{volunteer.email}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {volunteer.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {volunteer.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{volunteer.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => assignVolunteer(volunteer)} disabled={assigning}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assigned Volunteers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assigned Volunteers ({assignedVolunteers.length})</h3>

            <div className="overflow-y-auto h-full space-y-2">
              {assignedVolunteers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No volunteers assigned yet.</div>
              ) : (
                assignedVolunteers.map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={volunteer.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {volunteer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{volunteer.name}</div>
                        <div className="text-sm text-gray-500">{volunteer.email}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {volunteer.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {volunteer.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{volunteer.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unassignVolunteer(volunteer)}
                      disabled={assigning}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
