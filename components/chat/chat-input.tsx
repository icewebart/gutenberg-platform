"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Smile } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending || disabled) return

    setSending(true)
    try {
      await onSendMessage(message.trim())
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || sending}
            className="min-h-[44px] max-h-32 resize-none pr-20"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={disabled}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={disabled}>
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button type="submit" disabled={!message.trim() || sending || disabled} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
