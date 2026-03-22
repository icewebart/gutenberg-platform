"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, Users, User, Crown } from "lucide-react"

interface RoleBadgeProps {
  role: "volunteer" | "participant" | "board_member" | "admin"
  size?: "sm" | "md" | "lg"
}

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: Crown,
        }
      case "board_member":
        return {
          label: "Board Member",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Shield,
        }
      case "volunteer":
        return {
          label: "Volunteer",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Users,
        }
      case "participant":
        return {
          label: "Participant",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: User,
        }
      default:
        return {
          label: "Unknown",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: User,
        }
    }
  }

  const config = getRoleConfig(role)
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Badge className={`${config.color} ${sizeClasses[size]} flex items-center gap-1 border`}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  )
}
