"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  redirect("/")
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: formData.get("fullName") as string,
        role: (formData.get("role") as string) || "volunteer",
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  return { success: "Check your email to confirm your account!" }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth")
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Password reset email sent! Check your inbox." }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/")
}

export async function createDemoUser(role: "admin" | "manager" | "volunteer") {
  const supabase = await createClient()

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
    redirect("/")
    return
  }

  // User doesn't exist, create them
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: userData.fullName,
        role: role,
      },
    },
  })

  if (error) {
    return { error: error.message }
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
      return { error: signInError2.message }
    }
  }

  redirect("/")
}
