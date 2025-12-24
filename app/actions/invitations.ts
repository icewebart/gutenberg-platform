"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { createInvitation, cancelInvitation, resendInvitation } from "@/lib/supabase/invitations"
import type { CreateInvitationData } from "@/lib/supabase/invitations"

export async function sendInvitationAction(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user has permission (admin or board_member)
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "board_member")) {
    throw new Error("Unauthorized: Only admins and board members can send invitations")
  }

  const invitationData: CreateInvitationData = {
    email: formData.get("email") as string,
    name: formData.get("name") as string,
    role: formData.get("role") as "volunteer" | "participant" | "board_member",
    organizationId: formData.get("organizationId") as string,
    netzwerkCityId: (formData.get("netzwerkCityId") as string) || undefined,
    department: (formData.get("department") as string) || undefined,
  }

  try {
    const invitation = await createInvitation(invitationData, user.id)

    // TODO: Send invitation email here
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/accept-invite?token=${invitation.invitationToken}`

    console.log("[v0] Invitation link:", invitationLink)
    // In production, send email with invitationLink

    revalidatePath("/volunteers")
    return { success: true, invitationId: invitation.id, invitationLink }
  } catch (error) {
    console.error("[v0] Send invitation error:", error)
    return { success: false, error: "Failed to send invitation" }
  }
}

export async function cancelInvitationAction(invitationId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    await cancelInvitation(invitationId)
    revalidatePath("/volunteers")
    return { success: true }
  } catch (error) {
    console.error("[v0] Cancel invitation error:", error)
    return { success: false, error: "Failed to cancel invitation" }
  }
}

export async function resendInvitationAction(invitationId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    const invitation = await resendInvitation(invitationId)

    // TODO: Resend invitation email here
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/accept-invite?token=${invitation.invitationToken}`

    console.log("[v0] Resend invitation link:", invitationLink)

    revalidatePath("/volunteers")
    return { success: true, invitationLink }
  } catch (error) {
    console.error("[v0] Resend invitation error:", error)
    return { success: false, error: "Failed to resend invitation" }
  }
}

export async function createMemberManuallyAction(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if user has permission (admin or board_member)
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "board_member")) {
    throw new Error("Unauthorized: Only admins and board members can create members manually")
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as string
  const organizationId = formData.get("organizationId") as string
  const netzwerkCityId = (formData.get("netzwerkCityId") as string) || undefined
  const department = (formData.get("department") as string) || undefined

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
      },
    })

    if (authError || !authData.user) {
      throw new Error("Failed to create user account")
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: authData.user.id,
      name,
      email,
      role,
      organization_id: organizationId,
      netzwerk_city_id: netzwerkCityId,
      department,
      is_active: true,
      is_verified: true,
    })

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error("Failed to create user profile")
    }

    revalidatePath("/volunteers")
    return { success: true, userId: authData.user.id }
  } catch (error) {
    console.error("[v0] Create member manually error:", error)
    return { success: false, error: "Failed to create member" }
  }
}
