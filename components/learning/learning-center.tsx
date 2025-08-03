"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseFilters } from "./course-filters"
import { CourseCard } from "./course-card"
import { CourseDetailModal } from "./course-detail-modal"
import { CreateCourseModal } from "./create-course-modal"
import { mockCourses, courseDifficulties } from "../../data/courses-data"
import { useAuth } from "../auth-context"
import { BookOpen, Clock, Users, Award, Plus } from "lucide-react"
import type { Course } from "../../types/organization"

export function LearningCenter() {
  const { user, hasPermission } = useAuth()
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [enrollmentFilter, setEnrollmentFilter] = useState("all")
  const [sortBy, setSortBy] = useState("title")

  useEffect(() => {
    let newFilteredCourses = [...courses]

    // Apply tab filtering first
    if (activeTab === "enrolled") {
      newFilteredCourses = newFilteredCourses.filter((course) => course.enrolledUsers.includes(user?.id || ""))
    } else if (activeTab === "completed") {
      newFilteredCourses = newFilteredCourses.filter((course) => course.completedUsers.includes(user?.id || ""))
    } else if (activeTab === "created") {
      newFilteredCourses = newFilteredCourses.filter((course) => course.instructor === user?.name)
    }

    // Apply search query
    if (searchQuery) {
      newFilteredCourses = newFilteredCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      newFilteredCourses = newFilteredCourses.filter((course) => selectedCategories.includes(course.category))
    }

    // Apply difficulty filters
    if (selectedDifficulties.length > 0) {
      newFilteredCourses = newFilteredCourses.filter((course) => selectedDifficulties.includes(course.difficulty))
    }

    // Apply enrollment filter
    if (enrollmentFilter !== "all") {
      if (enrollmentFilter === "enrolled") {
        newFilteredCourses = newFilteredCourses.filter((course) => course.enrolledUsers.includes(user?.id || ""))
      } else if (enrollmentFilter === "completed") {
        newFilteredCourses = newFilteredCourses.filter((course) => course.completedUsers.includes(user?.id || ""))
      } else if (enrollmentFilter === "available") {
        newFilteredCourses = newFilteredCourses.filter((course) => !course.enrolledUsers.includes(user?.id || ""))
      }
    }

    // Apply sorting
    newFilteredCourses.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        case "difficulty":
          const difficultyOrder = courseDifficulties.map((d) => d.value)
          return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
        case "duration":
          const durationA = Number.parseInt(a.duration.split(" ")[0])
          const durationB = Number.parseInt(b.duration.split(" ")[0])
          return durationA - durationB
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "created-desc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "enrolled":
          return b.enrolledUsers.length - a.enrolledUsers.length
        default:
          return 0
      }
    })

    setFilteredCourses(newFilteredCourses)
  }, [searchQuery, selectedCategories, selectedDifficulties, enrollmentFilter, sortBy, courses, activeTab, user])

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setSelectedDifficulties([])
    setEnrollmentFilter("all")
    setSortBy("title")
  }

  const handleCreateCourse = (
    courseData: Omit<Course, "id" | "organizationId" | "createdAt" | "updatedAt" | "enrolledUsers" | "completedUsers">,
  ) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      organizationId: user?.organizationId || "",
      enrolledUsers: [],
      completedUsers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...courseData,
    }

    setCourses((prev) => [...prev, newCourse])
    setShowCreateModal(false)
  }

  const getUserProgress = (course: Course) => {
    if (!user || !course.enrolledUsers.includes(user.id)) return 0
    // Mock progress calculation
    return Math.floor(Math.random() * 100)
  }

  const stats = useMemo(
    () => ({
      totalCourses: courses.length,
      enrolledCourses: courses.filter((course) => course.enrolledUsers.includes(user?.id || "")).length,
      completedCourses: courses.filter((course) => course.completedUsers.includes(user?.id || "")).length,
      totalWeeks: courses.reduce((acc, course) => acc + Number.parseInt(course.duration.split(" ")[0]), 0),
    }),
    [courses, user],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Learning Center</h2>
          <p className="text-gray-600">Expand your knowledge and skills</p>
        </div>
        {hasPermission("create_courses") && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled</p>
                <p className="text-2xl font-bold">{stats.enrolledCourses}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completedCourses}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Weeks</p>
                <p className="text-2xl font-bold">{Math.round(stats.totalWeeks)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          {hasPermission("create_courses") && <TabsTrigger value="created">Created by Me</TabsTrigger>}
        </TabsList>

        <CourseFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          selectedDifficulties={selectedDifficulties}
          onDifficultiesChange={setSelectedDifficulties}
          enrollmentFilter={enrollmentFilter}
          onEnrollmentFilterChange={setEnrollmentFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
        />

        <TabsContent value={activeTab} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onViewDetails={setSelectedCourse}
                  progress={getUserProgress(course)}
                  isEnrolled={course.enrolledUsers.includes(user?.id || "")}
                  isCompleted={course.completedUsers.includes(user?.id || "")}
                  showManageOptions={activeTab === "created"}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No courses match your criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={(courseId) => {
            setCourses(
              courses.map((c) =>
                c.id === courseId ? { ...c, enrolledUsers: [...c.enrolledUsers, user?.id || ""] } : c,
              ),
            )
          }}
        />
      )}

      {showCreateModal && (
        <CreateCourseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateCourse={handleCreateCourse}
        />
      )}
    </div>
  )
}
