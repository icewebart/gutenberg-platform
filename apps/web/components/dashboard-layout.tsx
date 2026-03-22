"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  FolderOpen,
  MessageSquare,
  Store,
  GraduationCap,
  MessageCircle,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Building2,
  MapPin,
  Activity,
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
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { user, logout, hasPermission, hasRole } = useAuth()
  const { currentOrganization, netzwerkCities } = useMultiTenant()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user || !currentOrganization) return null

  const userNetzwerkCity = user.netzwerkCityId ? netzwerkCities.find((city) => city.id === user.netzwerkCityId) : null

  const getNavigationItems = () => {
    const baseItems = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: Activity,
        permission: null,
      },
    ]

    switch (user.role) {
      case "volunteer":
        return [
          ...baseItems,
          { id: "projects", label: "Projects", icon: FolderOpen, permission: "view_projects" },
          { id: "community", label: "Community", icon: MessageSquare, permission: "view_community" },
          { id: "learning", label: "Learning Center", icon: GraduationCap, permission: "view_learning_center" },
          { id: "store", label: "Store", icon: Store, permission: "view_store" },
          { id: "chat", label: "Chat", icon: MessageCircle, permission: null },
        ]

      case "participant":
        return [
          ...baseItems,
          { id: "my-projects", label: "My Projects", icon: FolderOpen, permission: "view_assigned_projects" },
          { id: "community", label: "Community", icon: MessageSquare, permission: "view_community" },
          { id: "learning", label: "Learning Center", icon: GraduationCap, permission: "view_learning_center" },
        ]

      case "board_member":
        return [
          ...baseItems,
          { id: "volunteers", label: "Volunteers", icon: Users, permission: "manage_volunteers" },
          { id: "projects", label: "Projects", icon: FolderOpen, permission: "view_projects" },
          { id: "netzwerk", label: "Netzwerk Cities", icon: MapPin, permission: "manage_netzwerk" },
          { id: "community", label: "Community", icon: MessageSquare, permission: "view_community" },
          { id: "learning", label: "Learning Center", icon: GraduationCap, permission: "view_learning_center" },
          { id: "store", label: "Store", icon: Store, permission: "view_store" },
          { id: "chat", label: "Chat", icon: MessageCircle, permission: null },
        ]

      case "admin":
        return [
          ...baseItems,
          { id: "organizations", label: "Organizations", icon: Building2, permission: "*" },
          { id: "users", label: "All Users", icon: Users, permission: "*" },
          { id: "volunteers", label: "Volunteers", icon: Users, permission: "*" },
          { id: "projects", label: "Projects", icon: FolderOpen, permission: "*" },
          { id: "netzwerk", label: "Netzwerk Cities", icon: MapPin, permission: "*" },
          { id: "community", label: "Community", icon: MessageSquare, permission: "*" },
          { id: "learning", label: "Learning Center", icon: GraduationCap, permission: "*" },
          { id: "store", label: "Store", icon: Store, permission: "*" },
          { id: "chat", label: "Chat", icon: MessageCircle, permission: "*" },
          { id: "settings", label: "Settings", icon: Settings, permission: "*" },
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

  const handleLogout = () => {
    logout()
  }

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

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <OrganizationSelector />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <div className="flex items-center gap-1">
                  <RoleBadge role={user.role} />
                  {userNetzwerkCity && <span className="text-xs text-gray-500 ml-1">• {userNetzwerkCity.name}</span>}
                </div>
              </div>
              <div className="relative group">
                <Button variant="ghost" className="flex items-center gap-2 rounded-xl">
                  <Avatar className="h-8 w-8 border-2 border-blue-200">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50 hidden group-hover:block">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
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
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                      activeTab === item.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
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
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    activeTab === item.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            key={activeTab}
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
