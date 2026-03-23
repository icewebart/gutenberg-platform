"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@gutenberg/shared"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: { name: string; email: string; password: string; role?: string }) => Promise<boolean>
  loading: boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/bff/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUser(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const res = await fetch("/api/bff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return false
      const { user: loggedIn } = await res.json()
      setUser(loggedIn)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch("/api/bff/auth/logout", { method: "POST" })
    setUser(null)
  }

  const register = async (userData: { name: string; email: string; password: string; role?: string }): Promise<boolean> => {
    try {
      setLoading(true)
      const res = await fetch("/api/bff/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      if (!res.ok) return false
      const { user: created } = await res.json()
      setUser(created)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if ((user.permissions as string[]).includes("*")) return true
    return (user.permissions as string[]).includes(permission)
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.role === role
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
