"use client"

import { useState, useMemo, useEffect } from "react"
import type { ChatConversation } from "@/types/organization"
import { conversations as mockConversations } from "@/data/chat-data"
import { users as allUsersData } from "@/data/users-data"
import { useAuth } from "@/components/auth-context"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { NewMessageModal } from "./new-message-modal"
import { Card, CardContent } from "@/components/ui/card"

export function ChatLayout() {
  const { user: currentUser, hasRole } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations)
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)

  const userConversations = useMemo(() => {
    if (!currentUser) return []
    return conversations.filter((c) => c.participants.includes(currentUser.id))
  }, [currentUser, conversations])

  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)

  useEffect(() => {
    if (userConversations.length > 0 && !selectedConversation) {
      const lastActiveConversation = userConversations.sort((a, b) => {
        const lastMsgA = new Date(a.messages[a.messages.length - 1]?.timestamp || 0).getTime()
        const lastMsgB = new Date(b.messages[b.messages.length - 1]?.timestamp || 0).getTime()
        return lastMsgB - lastMsgA
      })[0]
      setSelectedConversation(lastActiveConversation)
    }
  }, [userConversations, selectedConversation])

  const potentialRecipients = useMemo(() => {
    if (!currentUser) return []

    if (hasRole("board_member") || hasRole("admin")) {
      // Board members and admins can message any volunteer (active or inactive) or other board members/admins
      return allUsersData.filter(
        (u) => u.id !== currentUser.id && (u.role === "volunteer" || u.role === "board_member" || u.role === "admin"),
      )
    }

    if (hasRole("volunteer")) {
      // Volunteers can message other active volunteers and board members/admins
      return allUsersData.filter(
        (u) =>
          u.id !== currentUser.id &&
          u.isActive &&
          (u.role === "volunteer" || u.role === "board_member" || u.role === "admin"),
      )
    }

    return []
  }, [currentUser, hasRole])

  if (!currentUser) {
    return (
      <Card className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <p>Loading chat...</p>
      </Card>
    )
  }

  const handleSelectConversation = (conversation: ChatConversation) => {
    const updatedConversation = {
      ...conversation,
      messages: conversation.messages.map((m) => (m.senderId !== currentUser.id ? { ...m, isRead: true } : m)),
    }

    const updatedConversations = conversations.map((c) => (c.id === conversation.id ? updatedConversation : c))

    setConversations(updatedConversations)
    setSelectedConversation(updatedConversation)
  }

  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    }

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        const newMessages = [...conv.messages, newMessage]
        return { ...conv, messages: newMessages }
      }
      return conv
    })

    setConversations(updatedConversations)
    const updatedSelectedConv = updatedConversations.find((c) => c.id === selectedConversation.id)
    setSelectedConversation(updatedSelectedConv || null)
  }

  const handleCreateConversation = (userId: string) => {
    // Check if a conversation with this user already exists
    const existingConversation = conversations.find(
      (c) => c.participants.includes(userId) && c.participants.includes(currentUser.id),
    )

    if (existingConversation) {
      setSelectedConversation(existingConversation)
    } else {
      // Create a new conversation
      const newConversation: ChatConversation = {
        id: `conv-${Date.now()}`,
        participants: [currentUser.id, userId],
        messages: [],
      }
      setConversations((prev) => [...prev, newConversation])
      setSelectedConversation(newConversation)
    }
  }

  return (
    <>
      <Card className="h-[calc(100vh-10rem)] shadow-lg">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-full">
            <ChatSidebar
              conversations={userConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onNewMessage={() => setIsNewMessageModalOpen(true)}
              currentUser={currentUser}
              allUsers={allUsersData}
            />
            <ChatMessages
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              allUsers={allUsersData}
            />
          </div>
        </CardContent>
      </Card>
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        users={potentialRecipients}
        onCreateConversation={handleCreateConversation}
        currentUser={currentUser}
      />
    </>
  )
}
