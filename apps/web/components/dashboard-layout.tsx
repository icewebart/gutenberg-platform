"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useAuth } from "./auth-context"
import { useMultiTenant } from "./multi-tenant-context"
import { RoleBadge } from "./role-badge"
import { OrganizationSelector } from "./organization-selector"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, hasPermission, hasRole } = useAuth()
  const { currentOrganization, netzwerkCities } = useMultiTenant()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

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
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  3
                </span>
              </Button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden" style={{ zIndex: 9999 }}>
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all as read</span>
                  </div>
                  {[
                    { title: "New project assigned", time: "2 min ago", desc: "You were added to Project Alpha", seen: false },
                    { title: "Community reply", time: "1 hour ago", desc: "Someone replied to your post", seen: false },
                    { title: "New volunteer joined", time: "3 hours ago", desc: "Maria joined your organization", seen: false },
                    { title: "Course completed", time: "Yesterday", desc: "You completed Introduction to Gutenberg", seen: true },
                  ].map((n, i) => (
                    <div key={i} className={cn("px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 flex gap-3 items-start", n.seen ? "hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100")}>
                      <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", n.seen ? "bg-transparent" : "bg-blue-500")} />
                      <div>
                        <p className={cn("text-sm", n.seen ? "font-normal text-gray-700" : "font-medium text-gray-900")}>{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
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
                  <AvatarFallback className="rounded-none bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
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

        <aside className="hidden w-64 border-r bg-white lg:block">
          <nav className="p-4">
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
