"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

import type { Course, UserRole } from "@/types/organization"
import { courseCategories, courseDifficulties } from "@/data/courses-data"
import { useAuth } from "../auth-context"
import { useMultiTenant } from "../multi-tenant-context"

interface CreateCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateCourse: (courseData: Partial<Course>) => void
  editingCourse?: Course | null
}

export function CreateCourseModal({ isOpen, onClose, onCreateCourse, editingCourse }: CreateCourseModalProps) {
  const { user } = useAuth()
  const { currentOrganization } = useMultiTenant()

  const [formData, setFormData] = useState({
    title: editingCourse?.title || "",
    description: editingCourse?.description || "",
    content: editingCourse?.content || "",
    duration: editingCourse?.duration || "",
    difficulty: editingCourse?.difficulty || "beginner",
    category: editingCourse?.category || "programming",
    instructor: editingCourse?.instructor || user?.name || "",
    isPublic: editingCourse?.isPublic ?? true,
    certificateEnabled: editingCourse?.certificateEnabled ?? false,
    videoUrl: editingCourse?.videoUrl || "",
    visibleToRoles: editingCourse?.visibleToRoles || ["volunteer", "participant"],
    materials: editingCourse?.materials || [],
  })

  const [newMaterial, setNewMaterial] = useState("")

  const allRoles: UserRole[] = ["volunteer", "participant", "board_member", "admin"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !currentOrganization) return

    const courseData: Partial<Course> = {
      ...formData,
      organizationId: currentOrganization.id,
      createdAt: editingCourse?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enrolledUsers: editingCourse?.enrolledUsers || [],
      completedUsers: editingCourse?.completedUsers || [],
    }

    onCreateCourse(courseData)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      duration: "",
      difficulty: "beginner",
      category: "programming",
      instructor: user?.name || "",
      isPublic: true,
      certificateEnabled: false,
      videoUrl: "",
      visibleToRoles: ["volunteer", "participant"],
      materials: [],
    })
    setNewMaterial("")
  }

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()],
      }))
      setNewMaterial("")
    }
  }

  const removeMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }))
  }

  const handleRoleChange = (role: UserRole, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      visibleToRoles: checked ? [...prev.visibleToRoles, role] : prev.visibleToRoles.filter((r) => r !== role),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor *</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, instructor: e.target.value }))}
                    placeholder="Instructor name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what students will learn in this course"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseDifficulties.map((difficulty) => (
                        <SelectItem key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 6 weeks, 20 hours"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Preview Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://example.com/course-preview-video"
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Course Curriculum *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your course content using Markdown format. Use ### Module 1: Title for modules."
                  className="min-h-[200px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500">
                  Use Markdown format. Structure modules with "### Module 1: Title" for proper parsing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Add course material..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMaterial())}
                />
                <Button type="button" onClick={addMaterial} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.materials.map((material, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {material}
                    <button type="button" onClick={() => removeMaterial(index)} className="ml-1 hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visibility & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visibility & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Visible to Roles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {allRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={formData.visibleToRoles.includes(role)}
                        onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                      />
                      <label
                        htmlFor={`role-${role}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                      >
                        {role.replace("_", " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic">Public Course</Label>
                  <p className="text-sm text-gray-500">Make this course visible to all eligible users</p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="certificateEnabled">Enable Certificate</Label>
                  <p className="text-sm text-gray-500">Award certificates upon course completion</p>
                </div>
                <Switch
                  id="certificateEnabled"
                  checked={formData.certificateEnabled}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, certificateEnabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingCourse ? "Update Course" : "Create Course"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
