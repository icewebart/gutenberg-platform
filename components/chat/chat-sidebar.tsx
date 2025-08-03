"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquarePlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  title?: string
  type: "direct" | "group" | "project" | "announcement"
  participants: Array<{
    id: string
    name: string
    avatar?: string
  }>
  lastMessage?: {
    content: string
    created_at: string
    sender_name: string
  }
  unreadCount: number
}

interface ChatSidebarProps {
  conversations: Conversation[]
  selectedConversation: string | null
  onSelectConversation: (conversationId: string) => void
  onNewMessage: () => void
}

export function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewMessage,
}: ChatSidebarProps) {
  const getConversationTitle = (conversation: Conversation, currentUserId: string) => {
    if (conversation.title) {
      return conversation.title
    }

    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId)
      return otherParticipant?.name || "Unknown User"
    }

    return `Group Chat (${conversation.participants.length} members)`
  }

  const getConversationAvatar = (conversation: Conversation, currentUserId: string) => {
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId)
      return otherParticipant?.avatar || "/placeholder.svg"
    }

    // For group chats, use a default group avatar or the first participant's avatar
    return conversation.participants[0]?.avatar || "/placeholder.svg"
  }

  const getConversationInitials = (conversation: Conversation, currentUserId: string) => {
    if (conversation.type === "direct") {
      const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId)
      return (
        otherParticipant?.name
          ?.split(" ")
          .map((n) => n[0])
          .join("") || "U"
      )
    }

    return "G" // For group chats
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={onNewMessage} className="w-full gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Start a new conversation to get started</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === conversation.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getConversationAvatar(conversation, "") || "/placeholder.svg"} />
                    <AvatarFallback>{getConversationInitials(conversation, "")}</AvatarFallback>
                  </Avatar>
                  {conversation.unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                      {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">{getConversationTitle(conversation, "")}</h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: false })}
                      </span>
                    )}
                  </div>

                  {conversation.lastMessage ? (
                    <p className="text-sm text-gray-600 truncate">
                      <span className="font-medium">{conversation.lastMessage.sender_name}: </span>
                      {conversation.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No messages yet</p>
                  )}

                  {conversation.type === "group" && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {conversation.participants.length} members
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
