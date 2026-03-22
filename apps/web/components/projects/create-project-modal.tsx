"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, MapPin, Users, Award, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import type { Project } from "@/types/organization"
import { projectTypes } from "@/data/projects-data"
import { useAuth } from "../auth-context"
import { useMultiTenant } from "../multi-tenant-context"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateProject: (projectData: Partial<Project>) => void
  editingProject?: Project | null
}

export function CreateProjectModal({ isOpen, onClose, onCreateProject, editingProject }: CreateProjectModalProps) {
  const { user } = useAuth()
  const { currentOrganization, netzwerkCities } = useMultiTenant()

  const [formData, setFormData] = useState({
    title: editingProject?.title || "",
    description: editingProject?.description || "",
    type: editingProject?.type || "workshop",
    startDate: editingProject?.startDate || "",
    endDate: editingProject?.endDate || "",
    location: editingProject?.location || "",
    maxParticipants: editingProject?.maxParticipants?.toString() || "",
    pointsReward: editingProject?.pointsReward?.toString() || "0",
    netzwerkCityId: editingProject?.netzwerkCityId || "",
    requirements: editingProject?.requirements || [],
    materials: editingProject?.materials || [],
  })

  const [newRequirement, setNewRequirement] = useState("")
  const [newMaterial, setNewMaterial] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !currentOrganization) return

    const projectData: Partial<Project> = {
      ...formData,
      organizationId: currentOrganization.id,
      maxParticipants: formData.maxParticipants ? Number.parseInt(formData.maxParticipants) : undefined,
      pointsReward: Number.parseInt(formData.pointsReward) || 0,
      netzwerkCityId: formData.netzwerkCityId || undefined,
      createdBy: user.id,
      createdAt: editingProject?.createdAt || new Date().toISOString(),
      status: editingProject?.status || "upcoming",
      currentParticipants: editingProject?.currentParticipants || 0,
      participants: editingProject?.participants || [],
      volunteers: editingProject?.volunteers || [],
    }

    onCreateProject(projectData)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "workshop",
      startDate: "",
      endDate: "",
      location: "",
      maxParticipants: "",
      pointsReward: "0",
      netzwerkCityId: "",
      requirements: [],
      materials: [],
    })
    setNewRequirement("")
    setNewMaterial("")
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
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
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Project Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the project, its goals, and what participants will learn or achieve"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter project location"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="netzwerkCity">Netzwerk City</Label>
                  <Select
                    value={formData.netzwerkCityId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, netzwerkCityId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Netzwerk City (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Main Organization</SelectItem>
                      {netzwerkCities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule & Capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxParticipants: e.target.value }))}
                      placeholder="Leave empty for unlimited"
                      className="pl-9"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pointsReward">Points Reward</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pointsReward"
                      type="number"
                      value={formData.pointsReward}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pointsReward: e.target.value }))}
                      placeholder="0"
                      className="pl-9"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((requirement, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {requirement}
                    <button type="button" onClick={() => removeRequirement(index)} className="ml-1 hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Add a required material..."
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingProject ? "Update Project" : "Create Project"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
