"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Users, ImageIcon, FileText, Award, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProjectAction } from "@/app/actions/projects"

interface CreateProjectFormProps {
  organizationId: string
  netzwerkCityId?: string
  volunteers: Array<{
    id: string
    name: string
    email: string
    role: string
    department?: string
  }>
  currentUserId: string
}

export function CreateProjectForm({
  organizationId,
  netzwerkCityId,
  volunteers,
  currentUserId,
}: CreateProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [requirements, setRequirements] = useState<string[]>([])
  const [currentRequirement, setCurrentRequirement] = useState("")
  const [materials, setMaterials] = useState<string[]>([])
  const [currentMaterial, setCurrentMaterial] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const handleAddRequirement = () => {
    if (currentRequirement.trim()) {
      setRequirements([...requirements, currentRequirement.trim()])
      setCurrentRequirement("")
    }
  }

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleAddMaterial = () => {
    if (currentMaterial.trim()) {
      setMaterials([...materials, currentMaterial.trim()])
      setCurrentMaterial("")
    }
  }

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("organizationId", organizationId)
    if (netzwerkCityId) {
      formData.append("netzwerkCityId", netzwerkCityId)
    }
    formData.append("requirements", requirements.join(","))
    formData.append("materials", materials.join(","))
    formData.append("memberIds", selectedMembers.join(","))

    try {
      const result = await createProjectAction(formData)
      if (result.success) {
        router.push("/projects")
        router.refresh()
      } else {
        setError(result.error || "Failed to create project")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("[v0] Form submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the core details of your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Input id="title" name="title" placeholder="e.g., Sommerschule 2024 - Berlin" required className="mt-1" />
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description *</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              placeholder="Brief overview of the project (1-2 sentences)"
              required
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="longDescription">Long Description *</Label>
            <Textarea
              id="longDescription"
              name="longDescription"
              placeholder="Detailed description of the project, objectives, activities, and expected outcomes"
              required
              rows={6}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Specify dates, location, and type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="projectDate">Project Date *</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input id="projectDate" name="projectDate" type="date" required className="pl-10" />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input id="location" name="location" placeholder="e.g., Berlin, Germany" required className="pl-10" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input id="startDate" name="startDate" type="date" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input id="endDate" name="endDate" type="date" className="mt-1" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="projectType">Project Type *</Label>
              <Select name="projectType" defaultValue="other" required>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sommerschule">Sommerschule</SelectItem>
                  <SelectItem value="wintercamp">Wintercamp</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue="upcoming" required>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">Project Image URL (Optional)</Label>
            <div className="relative mt-1">
              <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team & Participants */}
      <Card>
        <CardHeader>
          <CardTitle>Team & Participants</CardTitle>
          <CardDescription>Assign project manager and team members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectManagerId">Project Manager</Label>
            <Select name="projectManagerId">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a project manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No manager assigned</SelectItem>
                {volunteers.map((volunteer) => (
                  <SelectItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.name} ({volunteer.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Project Members</Label>
            <p className="text-sm text-gray-600 mb-2">Select volunteers and team members for this project</p>
            <div className="max-h-48 overflow-y-auto rounded-lg border p-2 space-y-1">
              {volunteers
                .filter((v) => v.id !== currentUserId)
                .map((volunteer) => (
                  <label
                    key={volunteer.id}
                    className="flex items-center gap-2 rounded p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(volunteer.id)}
                      onChange={() => handleToggleMember(volunteer.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{volunteer.name}</p>
                      <p className="text-xs text-gray-600">
                        {volunteer.role} {volunteer.department && `• ${volunteer.department}`}
                      </p>
                    </div>
                  </label>
                ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">{selectedMembers.length} member(s) selected</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pointsReward">Points Reward</Label>
              <div className="relative mt-1">
                <Award className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="pointsReward"
                  name="pointsReward"
                  type="number"
                  min="0"
                  defaultValue="0"
                  placeholder="e.g., 500"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements & Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements & Materials</CardTitle>
          <CardDescription>List requirements and materials needed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="requirement">Requirements</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="requirement"
                value={currentRequirement}
                onChange={(e) => setCurrentRequirement(e.target.value)}
                placeholder="e.g., Must be enrolled in university"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRequirement())}
              />
              <Button type="button" onClick={handleAddRequirement} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {requirements.length > 0 && (
              <div className="mt-2 space-y-1">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 rounded bg-gray-50 px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{req}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRequirement(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="material">Materials</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="material"
                value={currentMaterial}
                onChange={(e) => setCurrentMaterial(e.target.value)}
                placeholder="e.g., Notebook and writing materials"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMaterial())}
              />
              <Button type="button" onClick={handleAddMaterial} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {materials.length > 0 && (
              <div className="mt-2 space-y-1">
                {materials.map((material, index) => (
                  <div key={index} className="flex items-center gap-2 rounded bg-gray-50 px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{material}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMaterial(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  )
}
