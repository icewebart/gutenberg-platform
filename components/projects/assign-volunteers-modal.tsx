"use client"

import { useState } from "react"
import { Search, UserPlus, Check } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import type { Project } from "@/types/organization"
import { useMultiTenant } from "../multi-tenant-context"
import { mockVolunteers } from "@/data/volunteers-data"

interface AssignVolunteersModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onAssignVolunteers: (projectId: string, volunteerIds: string[]) => void
}

export function AssignVolunteersModal({ project, isOpen, onClose, onAssignVolunteers }: AssignVolunteersModalProps) {
  const { netzwerkCities } = useMultiTenant()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])

  if (!project) return null

  // Filter volunteers based on search and availability
  const filteredVolunteers = mockVolunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.profile.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const isNotAlreadyAssigned = !project.volunteers.includes(volunteer.id)

    return matchesSearch && isNotAlreadyAssigned
  })

  const handleVolunteerToggle = (volunteerId: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volunteerId) ? prev.filter((id) => id !== volunteerId) : [...prev, volunteerId],
    )
  }

  const handleAssign = () => {
    onAssignVolunteers(project.id, selectedVolunteers)
    setSelectedVolunteers([])
    onClose()
  }

  const getNetzwerkCityName = (cityId?: string) => {
    if (!cityId) return "Main Organization"
    return netzwerkCities.find((city) => city.id === cityId)?.name || "Unknown City"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Volunteers to {project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search volunteers by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Currently Assigned Volunteers */}
          {project.volunteers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Currently Assigned ({project.volunteers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.volunteers.map((volunteerId, index) => {
                    const volunteer = mockVolunteers.find((v) => v.id === volunteerId)
                    return (
                      <div key={volunteerId} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={volunteer?.avatar || "/placeholder.svg"} alt={volunteer?.name} />
                          <AvatarFallback>
                            {volunteer?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || `V${index + 1}`}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{volunteer?.name || `Volunteer ${index + 1}`}</p>
                          <p className="text-sm text-gray-600">{volunteer?.email || "volunteer@example.com"}</p>
                          <p className="text-xs text-gray-500">{getNetzwerkCityName(volunteer?.netzwerkCityId)}</p>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3 w-3" />
                          Assigned
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Volunteers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Available Volunteers ({filteredVolunteers.length})
                {selectedVolunteers.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedVolunteers.length} selected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredVolunteers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No volunteers found matching your search." : "No available volunteers to assign."}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedVolunteers.includes(volunteer.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50",
                      )}
                      onClick={() => handleVolunteerToggle(volunteer.id)}
                    >
                      <Checkbox
                        checked={selectedVolunteers.includes(volunteer.id)}
                        onChange={() => handleVolunteerToggle(volunteer.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={volunteer.avatar || "/placeholder.svg"} alt={volunteer.name} />
                        <AvatarFallback>
                          {volunteer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{volunteer.name}</p>
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              volunteer.status === "online" ? "bg-green-500" : "bg-yellow-500",
                            )}
                          />
                        </div>
                        <p className="text-sm text-gray-600">{volunteer.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{volunteer.profile.location}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">{getNetzwerkCityName(volunteer.netzwerkCityId)}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-yellow-600">{volunteer.gamification.points} points</p>
                        </div>
                        {volunteer.profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {volunteer.profile.skills.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {volunteer.profile.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{volunteer.profile.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={selectedVolunteers.length === 0} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Assign {selectedVolunteers.length} Volunteer{selectedVolunteers.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
