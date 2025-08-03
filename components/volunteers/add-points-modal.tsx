"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AddPointsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddPointsModal({ isOpen, onClose }: AddPointsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add or Redeem Points</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup defaultValue="earned" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="earned" id="earned" />
                <Label htmlFor="earned">Earned</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="redeemed" id="redeemed" />
                <Label htmlFor="redeemed">Redeemed</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input id="points" type="number" placeholder="e.g., 100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" placeholder="e.g., Extra contribution to project" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={onClose}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
