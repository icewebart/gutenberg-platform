"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Clock,
  Users,
  Play,
  CheckCircle,
  Award,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import type { Course } from "@/types/organization"
import type { CourseProgress } from "@/data/courses-data"
import { courseCategories, courseDifficulties } from "@/data/courses-data"
import { useAuth } from "../auth-context"

interface CourseCardProps {
  course: Course
  progress?: CourseProgress
  onEnroll?: (courseId: string) => void
  onContinue?: (courseId: string) => void
  onViewDetails?: (course: Course) => void
  onEdit?: (course: Course) => void
  onDelete?: (courseId: string) => void
}

export function CourseCard({
  course,
  progress,
  onEnroll,
  onContinue,
  onViewDetails,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const { user, hasPermission } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  const category = courseCategories.find((c) => c.value === course.category)
  const difficulty = courseDifficulties.find((d) => d.value === course.difficulty)

  const isEnrolled = progress !== undefined
  const isCompleted = progress?.completionPercentage === 100
  const canEnroll = user && course.visibleToRoles.includes(user.role) && !isEnrolled
  const canManage = hasPermission("manage_courses") || hasPermission("*")

  const formatDuration = (duration: string) => {
    return duration.replace(/(\d+)\s*weeks?/i, "$1w").replace(/(\d+)\s*hours?/i, "$1h")
  }

  const getTimeSpentDisplay = () => {
    if (!progress?.timeSpent) return "0h"
    const hours = Math.floor(progress.timeSpent / 60)
    const minutes = progress.timeSpent % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Course Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <span>{category.icon}</span>
                    {category.label}
                  </Badge>
                )}
                {difficulty && <Badge className={cn("text-xs", difficulty.color)}>{difficulty.label}</Badge>}
                {!course.isPublic && (
                  <Badge variant="secondary" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">{course.title}</h3>
            </div>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails?.(course)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(course)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(course.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>

          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{course.enrolledUsers.length} enrolled</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span>{course.materials?.length || 0} materials</span>
            </div>
            {course.certificateEnabled && (
              <div className="flex items-center gap-2 text-yellow-600">
                <Award className="h-4 w-4" />
                <span>Certificate</span>
              </div>
            )}
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt={course.instructor} />
              <AvatarFallback className="text-xs">
                {course.instructor
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{course.instructor}</p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>

          {/* Progress (if enrolled) */}
          {isEnrolled && progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-gray-600">{progress.completionPercentage}%</span>
              </div>
              <Progress value={progress.completionPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {progress.completedModules.length}/{progress.totalModules} modules
                </span>
                <span>{getTimeSpentDisplay()} spent</span>
              </div>
            </div>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Course Completed!</p>
                {progress?.certificateEarned && <p className="text-xs text-green-600">Certificate earned</p>}
              </div>
              {progress?.certificateEarned && <Award className="h-5 w-5 text-yellow-500" />}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex w-full gap-2">
            {canEnroll && (
              <Button onClick={() => onEnroll?.(course.id)} className="flex-1 rounded-xl">
                <UserPlus className="mr-2 h-4 w-4" />
                Enroll Now
              </Button>
            )}

            {isEnrolled && !isCompleted && (
              <Button onClick={() => onContinue?.(course.id)} className="flex-1 rounded-xl">
                <Play className="mr-2 h-4 w-4" />
                Continue Learning
              </Button>
            )}

            {isCompleted && (
              <Button
                variant="outline"
                onClick={() => onContinue?.(course.id)}
                className="flex-1 rounded-xl bg-transparent"
              >
                <Eye className="mr-2 h-4 w-4" />
                Review Course
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => onViewDetails?.(course)}
              className={cn("rounded-xl bg-transparent", canEnroll || isEnrolled ? "flex-shrink-0" : "flex-1")}
            >
              <Eye className="mr-2 h-4 w-4" />
              {canEnroll || isEnrolled ? "" : "View Details"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
