"use client"

import { useState, useEffect } from "react"
import type { User as Volunteer } from "@/types/organization"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface EditVolunteerModalProps {
  isOpen: boolean
  onClose: () => void
  volunteer: Volunteer
  onSave: (volunteer: Volunteer) => void
}

const ROLES = ["volunteer", "participant", "board_member", "admin"]
const DEPARTMENTS = ["HR", "PR", "FR", "AB", "Board", "Alumni", "None"]

export function EditVolunteerModal({ isOpen, onClose, volunteer, onSave }: EditVolunteerModalProps) {
  const [editedVolunteer, setEditedVolunteer] = useState<Volunteer>(volunteer)

  useEffect(() => {
    setEditedVolunteer(volunteer)
  }, [volunteer])

  const handleSave = () => {
    onSave(editedVolunteer)
  }

  const handleFieldChange = (field: keyof Volunteer, value: any) => {
    setEditedVolunteer((prev) => ({ ...prev, [field]: value }))
  }

  const handleProfileFieldChange = (field: keyof Volunteer["profile"], value: any) => {
    setEditedVolunteer((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }))
  }

  const handleSocialLinkChange = (platform: "linkedin" | "facebook" | "instagram" | "tiktok", value: string) => {
    setEditedVolunteer((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        socialLinks: {
          ...prev.profile.socialLinks,
          [platform]: value,
        },
      },
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Volunteer: {volunteer.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <h4 className="font-semibold text-muted-foreground">Personal Information</h4>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editedVolunteer.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={editedVolunteer.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={editedVolunteer.phone || ""}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="bio" className="text-right pt-2">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={editedVolunteer.profile.bio || ""}
              onChange={(e) => handleProfileFieldChange("bio", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={editedVolunteer.profile.location || ""}
              onChange={(e) => handleProfileFieldChange("location", e.target.value)}
              className="col-span-3"
            />
          </div>

          <Separator className="my-4" />
          <h4 className="font-semibold text-muted-foreground">Social Links</h4>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="linkedin" className="text-right">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={editedVolunteer.profile.socialLinks?.linkedin || ""}
              onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
              className="col-span-3"
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="facebook" className="text-right">
              Facebook
            </Label>
            <Input
              id="facebook"
              value={editedVolunteer.profile.socialLinks?.facebook || ""}
              onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
              className="col-span-3"
              placeholder="facebook.com/username"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instagram" className="text-right">
              Instagram
            </Label>
            <Input
              id="instagram"
              value={editedVolunteer.profile.socialLinks?.instagram || ""}
              onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
              className="col-span-3"
              placeholder="instagram.com/username"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tiktok" className="text-right">
              TikTok
            </Label>
            <Input
              id="tiktok"
              value={editedVolunteer.profile.socialLinks?.tiktok || ""}
              onChange={(e) => handleSocialLinkChange("tiktok", e.target.value)}
              className="col-span-3"
              placeholder="tiktok.com/@username"
            />
          </div>

          <Separator className="my-4" />
          <h4 className="font-semibold text-muted-foreground">Organizational Information</h4>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={editedVolunteer.role} onValueChange={(value) => handleFieldChange("role", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {role.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <Select
              value={editedVolunteer.department}
              onValueChange={(value) => handleFieldChange("department", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active Status
            </Label>
            <Switch
              id="isActive"
              checked={editedVolunteer.isActive}
              onCheckedChange={(checked) => handleFieldChange("isActive", checked)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isNetzwerk" className="text-right">
              Netzwerk Member
            </Label>
            <Switch
              id="isNetzwerk"
              checked={editedVolunteer.profile.wasMemberInNetzwerk}
              onCheckedChange={(checked) => handleProfileFieldChange("wasMemberInNetzwerk", checked)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
