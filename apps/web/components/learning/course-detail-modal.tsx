"use client"

import { useState } from "react"
import {
  BookOpen,
  Clock,
  Star,
  Users,
  Award,
  Play,
  CheckCircle,
  FileText,
  Video,
  Download,
  X,
  Calendar,
  User,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import type { Course } from "@/types/organization"
import type { CourseProgress } from "@/data/courses-data"
import { courseCategories, courseDifficulties } from "@/data/courses-data"
import { useAuth } from "../auth-context"

interface CourseDetailModalProps {
  course: Course | null
  progress?: CourseProgress
  isOpen: boolean
  onClose: () => void
  onEnroll?: (courseId: string) => void
  onContinue?: (courseId: string) => void
}

export function CourseDetailModal({ course, progress, isOpen, onClose, onEnroll, onContinue }: CourseDetailModalProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  if (!course) return null

  const category = courseCategories.find((c) => c.value === course.category)
  const difficulty = courseDifficulties.find((d) => d.value === course.difficulty)

  const isEnrolled = progress !== undefined
  const isCompleted = progress?.completionPercentage === 100
  const canEnroll = user && course.visibleToRoles.includes(user.role) && !isEnrolled

  const formatDuration = (duration: string) => {
    return duration
  }

  const getTimeSpentDisplay = () => {
    if (!progress?.timeSpent) return "0 hours"
    const hours = Math.floor(progress.timeSpent / 60)
    const minutes = progress.timeSpent % 60
    if (hours > 0) {
      return `${hours} hours ${minutes} minutes`
    }
    return `${minutes} minutes`
  }

  // Parse course content into modules
  const parseModules = (content: string) => {
    const lines = content.split("\n")
    const modules: Array<{ title: string; content: string; completed: boolean }> = []
    let currentModule: { title: string; content: string; completed: boolean } | null = null

    for (const line of lines) {
      if (line.startsWith("### Module ")) {
        if (currentModule) {
          modules.push(currentModule)
        }
        const moduleTitle = line.replace("### ", "")
        const moduleNumber = moduleTitle.match(/Module (\d+)/)?.[1]
        const isCompleted = progress?.completedModules.includes(`module-${moduleNumber}`) || false
        currentModule = { title: moduleTitle, content: "", completed: isCompleted }
      } else if (currentModule) {
        currentModule.content += line + "\n"
      }
    }

    if (currentModule) {
      modules.push(currentModule)
    }

    return modules
  }

  const modules = parseModules(course.content)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
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
              <DialogTitle className="text-2xl">{course.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-hidden">
            <TabsContent value="overview" className="space-y-6 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Course Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-gray-600">{formatDuration(course.duration)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Enrollment</p>
                        <p className="text-sm text-gray-600">{course.enrolledUsers.length} students enrolled</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Difficulty</p>
                        <p className="text-sm text-gray-600">{difficulty?.label}</p>
                      </div>
                    </div>

                    {course.certificateEnabled && (
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Certificate</p>
                          <p className="text-sm text-gray-600">Available upon completion</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Instructor</p>
                        <p className="text-sm text-gray-600">{course.instructor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Last Updated</p>
                        <p className="text-sm text-gray-600">{new Date(course.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Instructor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About the Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/placeholder.svg" alt={course.instructor} />
                        <AvatarFallback className="text-lg">
                          {course.instructor
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{course.instructor}</h3>
                        <p className="text-sm text-gray-600">Course Instructor</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Experienced professional with expertise in {category?.label.toLowerCase()}. Passionate about
                      teaching and helping students achieve their learning goals.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </CardContent>
              </Card>

              {/* Progress (if enrolled) */}
              {isEnrolled && progress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-lg font-bold">{progress.completionPercentage}%</span>
                    </div>
                    <Progress value={progress.completionPercentage} className="h-3" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Modules Completed</p>
                        <p className="text-gray-600">
                          {progress.completedModules.length}/{progress.totalModules}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Time Spent</p>
                        <p className="text-gray-600">{getTimeSpentDisplay()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Enrolled</p>
                        <p className="text-gray-600">{new Date(progress.enrolledAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Last Accessed</p>
                        <p className="text-gray-600">{new Date(progress.lastAccessedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {isCompleted && progress.certificateEarned && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <div className="flex-1">
                          <p className="font-medium text-green-800">Certificate Earned!</p>
                          <p className="text-sm text-green-600">
                            Earned on {new Date(progress.certificateEarnedAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {canEnroll && (
                  <Button onClick={() => onEnroll?.(course.id)} className="rounded-xl">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Enroll in Course
                  </Button>
                )}

                {isEnrolled && !isCompleted && (
                  <Button onClick={() => onContinue?.(course.id)} className="rounded-xl">
                    <Play className="mr-2 h-4 w-4" />
                    Continue Learning
                  </Button>
                )}

                {isCompleted && (
                  <Button
                    variant="outline"
                    onClick={() => onContinue?.(course.id)}
                    className="rounded-xl bg-transparent"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Review Course
                  </Button>
                )}

                {course.videoUrl && (
                  <Button variant="outline" className="rounded-xl bg-transparent">
                    <Video className="mr-2 h-4 w-4" />
                    Watch Preview
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="overflow-y-auto max-h-[60vh]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div
                        key={index}
                        className={cn(
                          "border rounded-lg p-4",
                          module.completed ? "bg-green-50 border-green-200" : "bg-gray-50",
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {module.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          )}
                          <h3 className="font-semibold">{module.title}</h3>
                        </div>
                        <ScrollArea className="max-h-32">
                          <div className="text-sm text-gray-600 whitespace-pre-line">{module.content.trim()}</div>
                        </ScrollArea>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="overflow-y-auto max-h-[60vh]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.materials && course.materials.length > 0 ? (
                    <div className="space-y-3">
                      {course.materials.map((material, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium">{material}</p>
                            <p className="text-sm text-gray-600">Course material</p>
                          </div>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No materials available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="overflow-y-auto max-h-[60vh]">
              {isEnrolled && progress ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Learning Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">{progress.completionPercentage}%</div>
                        <p className="text-gray-600">Course Completion</p>
                      </div>

                      <Progress value={progress.completionPercentage} className="h-3" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-blue-50">
                          <div className="text-2xl font-bold text-blue-600">{progress.completedModules.length}</div>
                          <p className="text-sm text-gray-600">Modules Completed</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-green-50">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.floor(progress.timeSpent / 60)}h
                          </div>
                          <p className="text-sm text-gray-600">Time Invested</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {progress.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{progress.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  {progress.bookmarkedSections.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Bookmarked Sections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {progress.bookmarkedSections.map((section, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <span className="text-sm capitalize">{section.replace(/-/g, " ")}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Enroll in this course to track your progress</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
