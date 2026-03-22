"use client"

import { useEffect, useRef } from "react"
import type { ChatConversation, User } from "@/types/organization"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { ChatInput } from "./chat-input"

interface ChatMessagesProps {
  conversation: ChatConversation | null
  currentUser: User
  allUsers: User[]
  onSendMessage: (content: string) => void
}

export function ChatMessages({ conversation, currentUser, allUsers, onSendMessage }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  if (!conversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800">Select a conversation</p>
          <p className="text-sm text-gray-500">Choose a user from the sidebar to start chatting.</p>
        </div>
      </div>
    )
  }

  const otherParticipantId = conversation.participants.find((p) => p !== currentUser.id)
  const otherParticipant = allUsers.find((u) => u.id === otherParticipantId)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        {otherParticipant ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant.profile?.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
              <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{otherParticipant.name}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    otherParticipant.status === "online" ? "bg-green-500" : "bg-gray-400",
                  )}
                />
                <p className="text-xs text-gray-500">{otherParticipant.status}</p>
              </div>
            </div>
          </div>
        ) : (
          <div />
        )}
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message) => {
          const isSender = message.senderId === currentUser.id
          const sender = allUsers.find((u) => u.id === message.senderId)
          return (
            <div key={message.id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
              {!isSender && sender && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={sender.profile?.avatar || "/placeholder.svg"} alt={sender.name} />
                  <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2",
                  isSender ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 border rounded-bl-none",
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={onSendMessage} disabled={!conversation} />
    </div>
  )
}
