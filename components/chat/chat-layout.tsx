"use client"

import { useState, useEffect } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./chat-messages"
import { NewMessageModal } from "./new-message-modal"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-context"

interface Conversation {
  id: string
  title?: string
  type: "direct" | "group"
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

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  created_at: string
  is_read: boolean
}

export function ChatLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchConversations()
      setupRealtimeSubscriptions()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversations (
            id,
            title,
            type,
            created_at
          )
        `)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error fetching conversations:", error)
        return
      }

      const conversationIds = data.map((item) => item.conversation_id)

      if (conversationIds.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      // Fetch participants for each conversation
      const conversationsWithParticipants = await Promise.all(
        data.map(async (item) => {
          const conversation = item.conversations

          // Get participants
          const { data: participantsData } = await supabase
            .from("conversation_participants")
            .select(`
              user_id,
              profiles (
                id,
                name,
                avatar
              )
            `)
            .eq("conversation_id", conversation.id)

          const participants = participantsData?.map((p: any) => p.profiles).filter(Boolean) || []

          // Get last message
          const { data: lastMessageData } = await supabase
            .from("messages")
            .select(`
              content,
              created_at,
              profiles (
                name
              )
            `)
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: false })
            .limit(1)

          const lastMessage = lastMessageData?.[0]
            ? {
                content: lastMessageData[0].content,
                created_at: lastMessageData[0].created_at,
                sender_name: lastMessageData[0].profiles?.name || "Unknown",
              }
            : undefined

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversation.id)
            .neq("sender_id", user.id)
            .eq("is_read", false)

          return {
            id: conversation.id,
            title: conversation.title,
            type: conversation.type,
            participants,
            lastMessage,
            unreadCount: unreadCount || 0,
          }
        }),
      )

      setConversations(conversationsWithParticipants)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          sender_id,
          created_at,
          is_read,
          profiles (
            name,
            avatar
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return
      }

      const formattedMessages = data.map((message: any) => ({
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        sender_name: message.profiles?.name || "Unknown",
        sender_avatar: message.profiles?.avatar,
        created_at: message.created_at,
        is_read: message.is_read,
      }))

      setMessages(formattedMessages)

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const setupRealtimeSubscriptions = () => {
    if (!user) return

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as any

          // If this message is for the currently selected conversation, add it to messages
          if (selectedConversation === newMessage.conversation_id) {
            fetchMessages(selectedConversation)
          }

          // Refresh conversations to update last message and unread counts
          fetchConversations()
        },
      )
      .subscribe()

    return () => {
      messagesSubscription.unsubscribe()
    }
  }

  const sendMessage = async (content: string) => {
    if (!selectedConversation || !user) return

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content,
      })

      if (error) {
        console.error("Error sending message:", error)
        return
      }

      // Messages will be updated via realtime subscription
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleNewConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
    fetchConversations()
    setIsNewMessageModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border">
      <div className="w-1/3 border-r">
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onNewMessage={() => setIsNewMessageModalOpen(true)}
        />
      </div>
      <div className="flex-1">
        {selectedConversation ? (
          <ChatMessages messages={messages} onSendMessage={sendMessage} currentUserId={user?.id || ""} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-sm">Choose a conversation from the sidebar or start a new one</p>
            </div>
          </div>
        )}
      </div>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onConversationCreated={handleNewConversation}
      />
    </div>
  )
}
