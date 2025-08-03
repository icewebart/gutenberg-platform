"use client"

import type React from "react"

import { useAuth } from "./auth-context"
import { LoginForm } from "./login-form"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredPermissions = [], requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Check permissions
  const hasRequiredPermissions = requiredPermissions.every((permission) => {
    if (user.role === "admin" || user.role === "board_member") return true
    return user.permissions.includes(permission)
  })

  if (!hasRequiredPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have the required permissions to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
