"use client"

import { useState } from "react"
import type { ChatConversation, User } from "@/types/organization"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/components/auth-context"

interface ChatSidebarProps {
  conversations: ChatConversation[]
  selectedConversation: ChatConversation | null
  onSelectConversation: (conversation: ChatConversation) => void
  onNewMessage: () => void
  currentUser: User
  allUsers: User[]
}

export function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewMessage,
  currentUser,
  allUsers,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { hasRole } = useAuth()

  const canCreateMessage = hasRole("admin") || hasRole("board_member") || hasRole("volunteer")

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipantId = conv.participants.find((p) => p !== currentUser.id)
    const otherParticipant = allUsers.find((u) => u.id === otherParticipantId)
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="flex flex-col border-r bg-white h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Chats</h2>
          {canCreateMessage && (
            <Button variant="ghost" size="icon" onClick={onNewMessage}>
              <PlusCircle className="h-5 w-5" />
              <span className="sr-only">New Message</span>
            </Button>
          )}
        </div>
        <Input
          placeholder="Search chats..."
          className="mt-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {filteredConversations.map((conv) => {
            const otherParticipantId = conv.participants.find((p) => p !== currentUser.id)
            const otherParticipant = allUsers.find((u) => u.id === otherParticipantId)
            const lastMessage = conv.messages[conv.messages.length - 1]
            const unreadCount = conv.messages.filter((m) => !m.isRead && m.senderId !== currentUser.id).length

            if (!otherParticipant) return null

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
                  selectedConversation?.id === conv.id ? "bg-blue-100" : "hover:bg-gray-100",
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={otherParticipant.profile?.avatar || "/placeholder.svg"}
                    alt={otherParticipant.name}
                  />
                  <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{otherParticipant.name}</p>
                  {lastMessage && <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>}
                </div>
                <div className="flex flex-col items-end text-xs text-gray-400">
                  {lastMessage && <p>{formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}</p>}
                  {unreadCount > 0 && (
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
