"use client"

import { useState } from "react"
import {
  Calendar,
  MapPin,
  Users,
  Award,
  CheckCircle,
  FileText,
  Package,
  UserPlus,
  MessageSquare,
  Share2,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import type { Project } from "@/types/organization"
import { projectTypes, projectStatuses } from "@/data/projects-data"
import { useAuth } from "../auth-context"
import { useMultiTenant } from "../multi-tenant-context"

interface ProjectDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onJoinProject?: (projectId: string) => void
  onAssignVolunteers?: (project: Project) => void
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onJoinProject,
  onAssignVolunteers,
}: ProjectDetailModalProps) {
  const { user, hasPermission } = useAuth()
  const { netzwerkCities } = useMultiTenant()
  const [activeTab, setActiveTab] = useState("overview")
  const [comment, setComment] = useState("")

  if (!project) return null

  const projectType = projectTypes.find((t) => t.value === project.type)
  const projectStatus = projectStatuses.find((s) => s.value === project.status)
  const netzwerkCity = project.netzwerkCityId ? netzwerkCities.find((c) => c.id === project.netzwerkCityId) : null

  const progressPercentage = project.maxParticipants ? (project.currentParticipants / project.maxParticipants) * 100 : 0

  const isUserParticipant = user && project.participants.includes(user.id)
  const isUserVolunteer = user && project.volunteers.includes(user.id)
  const canJoin =
    user?.role === "volunteer" &&
    !isUserParticipant &&
    !isUserVolunteer &&
    project.status === "upcoming" &&
    project.currentParticipants < (project.maxParticipants || Number.POSITIVE_INFINITY)

  const getDaysUntilStart = () => {
    const startDate = new Date(project.startDate)
    const today = new Date()
    const diffTime = startDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilStart = getDaysUntilStart()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {projectType && <Badge className={cn("text-xs", projectType.color)}>{projectType.label}</Badge>}
                {projectStatus && <Badge className={cn("text-xs", projectStatus.color)}>{projectStatus.label}</Badge>}
                {netzwerkCity && (
                  <Badge variant="outline" className="text-xs">
                    {netzwerkCity.name}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl">{project.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Project Images */}
        {project.images && project.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {project.images.map((image, index) => (
              <div key={index} className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${project.title} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-gray-600">
                        {new Date(project.startDate).toLocaleDateString()} -{" "}
                        {new Date(project.endDate).toLocaleDateString()}
                      </p>
                      {project.status === "upcoming" && daysUntilStart > 0 && (
                        <p className="text-sm text-blue-600">{daysUntilStart} days until start</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-gray-600">{project.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-sm text-gray-600">
                        {project.currentParticipants}
                        {project.maxParticipants && ` / ${project.maxParticipants}`} enrolled
                      </p>
                    </div>
                  </div>

                  {project.pointsReward > 0 && (
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Points Reward</p>
                        <p className="text-sm text-yellow-600">{project.pointsReward} points</p>
                      </div>
                    </div>
                  )}

                  {/* Enrollment Progress */}
                  {project.maxParticipants && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Enrollment Progress</span>
                        <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canJoin && (
                <Button onClick={() => onJoinProject?.(project.id)} className="rounded-xl">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Project
                </Button>
              )}

              {(hasPermission("manage_projects") || hasPermission("*")) && (
                <Button variant="outline" onClick={() => onAssignVolunteers?.(project)} className="rounded-xl">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Volunteers
                </Button>
              )}

              <Button variant="outline" className="rounded-xl bg-transparent">
                <Share2 className="mr-2 h-4 w-4" />
                Share Project
              </Button>

              {(isUserParticipant || isUserVolunteer) && (
                <Badge variant="secondary" className="px-3 py-1 gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {isUserVolunteer ? "Volunteering" : "Enrolled"}
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Volunteers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Volunteers ({project.volunteers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.volunteers.map((volunteerId, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" alt="Volunteer" />
                        <AvatarFallback>V{index + 1}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">Volunteer {index + 1}</p>
                        <p className="text-sm text-gray-600">volunteer@example.com</p>
                      </div>
                      <Badge variant="outline">Volunteer</Badge>
                    </div>
                  ))}
                  {project.volunteers.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No volunteers assigned yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants ({project.participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.participants.map((participantId, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" alt="Participant" />
                        <AvatarFallback>P{index + 1}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">Participant {index + 1}</p>
                        <p className="text-sm text-gray-600">participant@example.com</p>
                      </div>
                      <Badge variant="outline">Participant</Badge>
                    </div>
                  ))}
                  {project.participants.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No participants enrolled yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.requirements && project.requirements.length > 0 ? (
                    <ul className="space-y-2">
                      {project.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No specific requirements</p>
                  )}
                </CardContent>
              </Card>

              {/* Materials */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Required Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.materials && project.materials.length > 0 ? (
                    <ul className="space-y-2">
                      {project.materials.map((material, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{material}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No materials required</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="discussion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Project Discussion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comment Input */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Share your thoughts, ask questions, or provide updates..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button className="rounded-xl">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Post Comment
                  </Button>
                </div>

                {/* Sample Comments */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">Project Coordinator</span>
                        <Badge variant="outline" className="text-xs">
                          Volunteer
                        </Badge>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Looking forward to this project! I've prepared all the materials and the venue is confirmed.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">Participant</span>
                        <Badge variant="outline" className="text-xs">
                          Participant
                        </Badge>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Quick question about the schedule - will there be breaks between sessions?
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
