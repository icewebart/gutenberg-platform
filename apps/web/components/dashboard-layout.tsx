"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users,
  FolderOpen,
  MessageSquare,
  Store,
  GraduationCap,
  MessageCircle,
  Bell,
  Menu,
  X,
  LogOut,
  Building2,
  Activity,
  UserCog,
  Award,
  CheckSquare,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useAuth } from "./auth-context"
import { useMultiTenant } from "./multi-tenant-context"
import { RoleBadge } from "./role-badge"
import { OrganizationSelector } from "./organization-selector"
import { getAvatarGradient } from "@/lib/avatar-gradient"

interface DashboardLayoutProps {
  children: React.ReactNode
}

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
  return days === 1 ? "Yesterday" : `${days}d ago`
}

function notifIcon(type: string): string {
  switch (type) {
    case "member_joined": return "👋"
    case "project_assigned": return "📁"
    case "task_assigned": return "✅"
    case "task_completed": return "🏆"
    case "community_reply": return "💬"
    case "application_approved": return "🎉"
    case "application_rejected": return "📋"
    default: return "🔔"
  }
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, hasPermission, hasRole } = useAuth()
  const { currentOrganization, netzwerkCities } = useMultiTenant()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifLoading, setNotifLoading] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true)
      const res = await fetch("/api/bff/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data.slice(0, 8) : [])
      }
    } catch { /* silent */ }
    finally { setNotifLoading(false) }
  }, [])

  // Fetch when bell opens, also poll every 60s
  useEffect(() => {
    if (notifOpen) fetchNotifications()
  }, [notifOpen, fetchNotifications])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAllRead = async () => {
    await fetch("/api/bff/notifications/read-all", { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleNotifClick = async (n: Notification) => {
    if (!n.isRead) {
      await fetch(`/api/bff/notifications/${n.id}/read`, { method: "PATCH" })
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x))
    }
    setNotifOpen(false)
    if (n.link) router.push(n.link)
    else router.push("/notifications")
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user || !currentOrganization) return null

  const userNetzwerkCity = user.netzwerkCityId ? netzwerkCities.find((city) => city.id === user.netzwerkCityId) : null

  const getNavigationItems = () => {
    const baseItems = [{ href: "/dashboard", label: "Dashboard", icon: Activity, permission: null }]

    switch (user.role) {
      case "volunteer":
        return [
          ...baseItems,
          { href: "/tasks", label: "Tasks", icon: CheckSquare, permission: null },
          { href: "/projects", label: "Projects", icon: FolderOpen, permission: "view_projects" },
          { href: "/community", label: "Community", icon: MessageSquare, permission: "view_community" },
          { href: "/learning", label: "Learning Center", icon: GraduationCap, permission: "view_learning_center" },
          { href: "/store", label: "Store", icon: Store, permission: "view_store" },
          { href: "/chat", label: "Chat", icon: MessageCircle, permission: null },
        ]

      case "participant":
        return [
          ...baseItems,
          { href: "/my-projects", label: "My Projects", icon: FolderOpen, permission: "view_assigned_projects" },
          { href: "/community", label: "Community", icon: MessageSquare, permission: "view_community" },
          { href: "/learning", label: "Learning Center", icon: GraduationCap, permission: "view_learning_center" },
        ]

      case "board_member":
        return [
          ...baseItems,
          { href: "/members", label: "Members", icon: Users, permission: "manage_volunteers" },
          { href: "/tasks", label: "Tasks", icon: CheckSquare, permission: null },
          { href: "/projects", label: "Projects", icon: FolderOpen, permission: "view_projects" },
          { href: "/community", label: "Community", icon: MessageSquare, permission: "view_community" },
          { href: "/learning", label: "Learning Center", icon: GraduationCap, permission: "view_learning_center" },
          { href: "/store", label: "Store", icon: Store, permission: "view_store" },
          { href: "/chat", label: "Chat", icon: MessageCircle, permission: null },
        ]

      case "admin":
        return [
          ...baseItems,
          { href: "/organizations", label: "Organizations", icon: Building2, permission: "*" },
          { href: "/members", label: "Members", icon: Users, permission: "*" },
          { href: "/tasks", label: "Tasks", icon: CheckSquare, permission: "*" },
          { href: "/projects", label: "Projects", icon: FolderOpen, permission: "*" },
          { href: "/community", label: "Community", icon: MessageSquare, permission: "*" },
          { href: "/learning", label: "Learning Center", icon: GraduationCap, permission: "*" },
          { href: "/store", label: "Store", icon: Store, permission: "*" },
          { href: "/chat", label: "Chat", icon: MessageCircle, permission: "*" },
        ]

      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems().filter((item) => {
    if (!item.permission) return true
    if (item.permission === "*") return hasRole("admin")
    return hasPermission(item.permission)
  })

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{currentOrganization.name}</h1>
                <p className="text-sm text-gray-500">Multi-Tenant Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <OrganizationSelector />
            </div>

            {/* Points */}
            {user.gamification && (
              <div className="hidden sm:flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 h-10 bg-white">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-800">
                  {((user.gamification as any).points ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">pts</span>
              </div>
            )}

            {/* Notification bell */}
            <div ref={notifRef} className="relative" style={{ zIndex: 9999 }}>
              <Button
                variant="outline"
                size="icon"
                className="relative border border-gray-200 rounded-xl"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden" style={{ zIndex: 9999 }}>
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 cursor-pointer hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={cn(
                            "w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 flex gap-3 items-start transition-colors",
                            n.isRead ? "hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100"
                          )}
                        >
                          <span className="text-base shrink-0 mt-0.5">{notifIcon(n.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm truncate", n.isRead ? "font-normal text-gray-700" : "font-medium text-gray-900")}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.isRead && (
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="border-t border-gray-100">
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block px-4 py-2.5 text-center text-sm text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div ref={userMenuRef} className="relative flex items-center gap-2" style={{ zIndex: 9999 }}>
              {/* Pill: name + badge */}
              <div className="hidden sm:flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 h-10">
                <p className="text-sm font-medium text-gray-900 leading-none">{user.name}</p>
                <RoleBadge role={user.role} />
                {userNetzwerkCity && <span className="text-xs text-gray-500">• {userNetzwerkCity.name}</span>}
              </div>
              {/* Avatar button — same style as bell */}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors"
              >
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} className="object-cover" />
                  <AvatarFallback className={`rounded-none bg-gradient-to-br ${getAvatarGradient(user.id)} text-white text-xs font-bold`}>
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2" style={{ zIndex: 9999 }}>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full px-4 py-2 mt-1 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserCog className="h-4 w-4" />
                    Profile &amp; Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-1" />
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="p-4 border-t">
              <div className="lg:hidden mb-4">
                <OrganizationSelector />
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden w-64 border-r bg-white lg:flex lg:flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
