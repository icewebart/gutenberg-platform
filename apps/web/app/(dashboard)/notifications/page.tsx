"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, CheckCheck, Trash2, Loader2, BellOff, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function typeIcon(type: string): string {
  switch (type) {
    case "member_joined": return "👋"
    case "project_assigned": return "📁"
    case "task_assigned": return "✅"
    case "task_completed": return "🏆"
    case "community_reply": return "💬"
    case "application_approved": return "🎉"
    case "application_rejected": return "📋"
    case "system": return "🔔"
    default: return "🔔"
  }
}

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Members", value: "member_joined" },
  { label: "Projects", value: "project_assigned" },
  { label: "Tasks", value: "task_assigned" },
  { label: "Community", value: "community_reply" },
  { label: "System", value: "system" },
]

export default function NotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/bff/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = async (id: string) => {
    await fetch(`/api/bff/notifications/${id}/read`, { method: "PATCH" })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    await fetch("/api/bff/notifications/read-all", { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setMarkingAll(false)
    toast({ title: "All notifications marked as read" })
  }

  const deleteNotification = async (id: string) => {
    await fetch(`/api/bff/notifications/${id}`, { method: "DELETE" })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markRead(n.id)
    if (n.link) router.push(n.link)
  }

  const filtered = filter ? notifications.filter((n) => n.type === filter) : notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="title-page flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your activity and updates from the platform</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingAll}>
            {markingAll ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
              filter === f.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BellOff className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-4 px-5 py-4 group transition-colors",
                n.isRead ? "hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100",
                n.link && "cursor-pointer"
              )}
              onClick={() => handleClick(n)}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg shadow-sm">
                {typeIcon(n.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm", n.isRead ? "text-gray-700" : "font-medium text-gray-900")}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead(n.id) }}
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                {n.link && (
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(n.link!) }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    title="Open"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
