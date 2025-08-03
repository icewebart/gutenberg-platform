"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  MapPin,
  Users,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  Award,
  CheckCircle,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import type { Project } from "@/types/organization"
import { projectTypes, projectStatuses } from "@/data/projects-data"
import { useAuth } from "../auth-context"
import { useMultiTenant } from "../multi-tenant-context"

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onAssignVolunteers?: (project: Project) => void
  onViewDetails?: (project: Project) => void
  onJoinProject?: (projectId: string) => void
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onAssignVolunteers,
  onViewDetails,
  onJoinProject,
}: ProjectCardProps) {
  const { user, hasPermission } = useAuth()
  const { netzwerkCities } = useMultiTenant()
  const [isHovered, setIsHovered] = useState(false)

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
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Project Image */}
        {project.images && project.images.length > 0 && (
          <div className="aspect-video overflow-hidden">
            <img
              src={project.images[0] || "/placeholder.svg"}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="pb-3">
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
              <h3 className="font-semibold text-lg leading-tight">{project.title}</h3>
            </div>

            {(hasPermission("manage_projects") || hasPermission("*")) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails?.(project)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(project)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAssignVolunteers?.(project)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Volunteers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(project.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

          {/* Project Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </span>
              {project.status === "upcoming" && daysUntilStart > 0 && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {daysUntilStart} days left
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {project.currentParticipants}
                {project.maxParticipants && ` / ${project.maxParticipants}`} participants
              </span>
            </div>

            {project.pointsReward > 0 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <Award className="h-4 w-4" />
                <span>{project.pointsReward} points reward</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {project.maxParticipants && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Enrollment</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Participants/Volunteers Avatars */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Volunteers:</span>
              <div className="flex -space-x-2">
                {project.volunteers.slice(0, 3).map((volunteerId, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src="/placeholder.svg" alt="Volunteer" />
                    <AvatarFallback className="text-xs">V</AvatarFallback>
                  </Avatar>
                ))}
                {project.volunteers.length > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
                    +{project.volunteers.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* User Status Indicators */}
            <div className="flex items-center gap-1">
              {isUserParticipant && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Enrolled
                </Badge>
              )}
              {isUserVolunteer && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Star className="h-3 w-3" />
                  Volunteer
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex w-full gap-2">
            <Button variant="outline" onClick={() => onViewDetails?.(project)} className="flex-1 rounded-xl">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>

            {canJoin && (
              <Button onClick={() => onJoinProject?.(project.id)} className="flex-1 rounded-xl">
                <UserPlus className="mr-2 h-4 w-4" />
                Join Project
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
