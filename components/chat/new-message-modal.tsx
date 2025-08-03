"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-context"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar?: string
  status: string
}

interface NewMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onConversationCreated: (conversationId: string) => void
}

export function NewMessageModal({ isOpen, onClose, onConversationCreated }: NewMessageModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupTitle, setGroupTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    } else {
      // Reset state when modal closes
      setSearchTerm("")
      setSelectedUsers([])
      setGroupTitle("")
    }
  }, [isOpen])

  const fetchUsers = async () => {
    if (!user?.organization_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, department, avatar, status")
        .eq("organization_id", user.organization_id)
        .eq("is_active", true)
        .neq("id", user.id) // Exclude current user
        .order("name")

      if (error) {
        console.error("Error fetching users:", error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const createConversation = async () => {
    if (selectedUsers.length === 0 || !user) return

    setCreating(true)
    try {
      const isGroup = selectedUsers.length > 1
      const conversationType = isGroup ? "group" : "direct"

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          title: isGroup ? groupTitle || `Group with ${selectedUsers.length} members` : null,
          type: conversationType,
          organization_id: user.organization_id,
          created_by: user.id,
        })
        .select()
        .single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        return
      }

      // Add participants (including current user)
      const allParticipants = [user.id, ...selectedUsers]
      const participantInserts = allParticipants.map((userId) => ({
        conversation_id: conversation.id,
        user_id: userId,
        is_admin: userId === user.id, // Creator is admin
      }))

      const { error: participantsError } = await supabase.from("conversation_participants").insert(participantInserts)

      if (participantsError) {
        console.error("Error adding participants:", participantsError)
        return
      }

      // Send initial system message for group chats
      if (isGroup) {
        const selectedUserNames = users
          .filter((u) => selectedUsers.includes(u.id))
          .map((u) => u.name)
          .join(", ")

        await supabase.from("messages").insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: `${user.name} created this group with ${selectedUserNames}`,
          message_type: "system",
        })
      }

      onConversationCreated(conversation.id)
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Group title (only show if multiple users selected) */}
          {selectedUsers.length > 1 && (
            <div>
              <Input
                placeholder="Group name (optional)"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
              />
            </div>
          )}

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected ({selectedUsers.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const selectedUser = users.find((u) => u.id === userId)
                  return (
                    <Badge
                      key={userId}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleUserSelection(userId)}
                    >
                      {selectedUser?.name} ×
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Users list */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? "No users found matching your search." : "No users available."}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(u.id) ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleUserSelection(u.id)}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(u.status)}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {u.role === "board_member" ? "Board Member" : u.role}
                      </Badge>
                      {u.department !== "None" && (
                        <Badge variant="outline" className="text-xs">
                          {u.department}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={createConversation} disabled={selectedUsers.length === 0 || creating} className="gap-2">
              {selectedUsers.length > 1 ? <Users className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              {creating ? "Creating..." : selectedUsers.length > 1 ? "Create Group" : "Start Chat"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
