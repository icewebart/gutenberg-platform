"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  role: "admin" | "manager" | "coordinator" | "volunteer"
  organization_id: string
  city_id: string
  created_at: string
  updated_at: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithDemo: (role: "admin" | "manager" | "volunteer") => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  signInWithDemo: async (role: "admin" | "manager" | "volunteer") => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchProfile(user.id)
      } else {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function signInWithDemo(role: "admin" | "manager" | "volunteer") {
    const demoUsers = {
      admin: {
        email: "admin@demo.com",
        password: "demo123456",
        fullName: "Admin Demo User",
        orgId: "550e8400-e29b-41d4-a716-446655440000",
      },
      manager: {
        email: "manager@demo.com",
        password: "demo123456",
        fullName: "Manager Demo User",
        orgId: "550e8400-e29b-41d4-a716-446655440001",
      },
      volunteer: {
        email: "volunteer@demo.com",
        password: "demo123456",
        fullName: "Volunteer Demo User",
        orgId: "550e8400-e29b-41d4-a716-446655440002",
      },
    }

    const userData = demoUsers[role]

    // Try to sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    })

    if (!signInError) {
      // User exists and signed in successfully
      return
    }

    // User doesn't exist, create them
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: userData.fullName,
          role: role,
        },
      },
    })

    if (error) {
      throw error
    }

    if (data.user) {
      // Create the profile with the specific role and organization
      const { error: profileError } = await supabase.rpc("create_demo_user_profile", {
        user_id: data.user.id,
        user_email: userData.email,
        user_name: userData.fullName,
        user_role: role,
        org_id: userData.orgId,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
      }

      // Sign in the newly created user
      const { error: signInError2 } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      })

      if (signInError2) {
        throw signInError2
      }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signOut,
    signInWithDemo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
