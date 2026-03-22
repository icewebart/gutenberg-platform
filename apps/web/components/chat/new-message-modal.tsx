"use client"

import { useState } from "react"
import type { User } from "@/types/organization"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NewMessageModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
  onCreateConversation: (userId: string) => void
  currentUser: User
}

export function NewMessageModal({ isOpen, onClose, users, onCreateConversation, currentUser }: NewMessageModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const potentialRecipients = users.filter(
    (user) => user.id !== currentUser.id && user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectUser = (userId: string) => {
    onCreateConversation(userId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>Select a person to start a conversation with.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {potentialRecipients.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-100"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
