"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ActivityLog, ProjectType, ProjectRole } from "@/types/organization"

interface EditActivityModalProps {
  isOpen: boolean
  onClose: () => void
  activity: ActivityLog
  onSave: (activity: ActivityLog) => void
}

const PROJECT_TYPES: ProjectType[] = [
  "Sommerschule",
  "Karawane",
  "Wintercamp",
  "Recrutierungen",
  "Netzwerk",
  "Eu-Projekt",
  "Andere",
]
const PROJECT_ROLES: ProjectRole[] = ["Volunteer", "Project Manager", "Project Assistant", "Project Mentor", "Other"]

export function EditActivityModal({ isOpen, onClose, activity, onSave }: EditActivityModalProps) {
  const [editedActivity, setEditedActivity] = useState<ActivityLog>(activity)

  useEffect(() => {
    setEditedActivity(activity)
  }, [activity])

  const handleSave = () => {
    onSave(editedActivity)
  }

  const handleChange = (field: keyof ActivityLog, value: string | number) => {
    setEditedActivity((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedActivity.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Workshop Organization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedActivity.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the activity..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points Awarded</Label>
              <Input
                id="points"
                type="number"
                value={editedActivity.points}
                onChange={(e) => handleChange("points", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={new Date(editedActivity.date).toISOString().split("T")[0]}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Select
              value={editedActivity.projectType}
              onValueChange={(v: ProjectType) => handleChange("projectType", v)}
            >
              <SelectTrigger id="projectType">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleInProject">Role in Project</Label>
            <Select
              value={editedActivity.roleInProject}
              onValueChange={(v: ProjectRole) => handleChange("roleInProject", v)}
            >
              <SelectTrigger id="roleInProject">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
