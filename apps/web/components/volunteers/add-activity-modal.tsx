"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ActivityLog, ProjectType, ProjectRole } from "@/types/organization"

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (activity: Omit<ActivityLog, "id">) => void
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

export function AddActivityModal({ isOpen, onClose, onAdd }: AddActivityModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [points, setPoints] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [projectType, setProjectType] = useState<ProjectType>("Andere")
  const [roleInProject, setRoleInProject] = useState<ProjectRole>("Volunteer")

  const handleSubmit = () => {
    if (!title || !date) {
      // Add some validation feedback
      return
    }
    onAdd({ title, description, points, date, projectType, roleInProject })
    onClose()
    // Reset form
    setTitle("")
    setDescription("")
    setPoints(0)
    setDate(new Date().toISOString().split("T")[0])
    setProjectType("Andere")
    setRoleInProject("Volunteer")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Workshop Organization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the activity..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points Awarded</Label>
              <Input id="points" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Select value={projectType} onValueChange={(v: ProjectType) => setProjectType(v)}>
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
            <Select value={roleInProject} onValueChange={(v: ProjectRole) => setRoleInProject(v)}>
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
          <Button type="button" onClick={handleSubmit}>
            Add Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
