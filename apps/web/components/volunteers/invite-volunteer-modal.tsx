"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMultiTenant } from "../multi-tenant-context"
import { useToast } from "@/hooks/use-toast"

interface InviteVolunteerModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (details: any) => void
}

export function InviteVolunteerModal({ isOpen, onClose, onInvite }: InviteVolunteerModalProps) {
  const { currentOrganization, netzwerkCities } = useMultiTenant()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("volunteer")
  const [assignment, setAssignment] = useState<string>(currentOrganization.id)
  const currentYear = new Date().getFullYear()

  const handleInvite = () => {
    if (!name || !email || !role || !assignment) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields.",
        variant: "destructive",
      })
      return
    }
    onInvite({ name, email, role, assignment, year: currentYear })
    toast({
      title: "Invitation Sent!",
      description: `${name} has been invited to join.`,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Volunteer</DialogTitle>
          <DialogDescription>
            Invite a new volunteer to the organization or a specific Netzwerk city for the year {currentYear}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignment" className="text-right">
              Assign to
            </Label>
            <Select value={assignment} onValueChange={setAssignment}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={currentOrganization.id}>{currentOrganization.name} (Main)</SelectItem>
                {netzwerkCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
                <SelectItem value="board_member">Board Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInvite}>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
