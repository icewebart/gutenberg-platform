"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const token = cookieStore.get("gutenberg_session")?.value
  if (!token) throw new Error("Not authenticated")
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
}

export async function sendInvitationAction(formData: FormData) {
  try {
    const headers = await getAuthHeaders()
    const body = {
      email: formData.get("email"),
      name: formData.get("name"),
      role: formData.get("role"),
      organizationId: formData.get("organizationId"),
      netzwerkCityId: formData.get("netzwerkCityId") || undefined,
      department: formData.get("department") || undefined,
    }
    const res = await fetch(`${API_URL}/invitations`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Failed to send invitation")
    const data = await res.json()
    revalidatePath("/volunteers")
    return { success: true, invitationId: data.id }
  } catch (error) {
    console.error("[invitations] Send error:", error)
    return { success: false, error: "Failed to send invitation" }
  }
}

export async function cancelInvitationAction(invitationId: string) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/invitations/${invitationId}/cancel`, {
      method: "POST",
      headers,
    })
    if (!res.ok) throw new Error("Failed to cancel invitation")
    revalidatePath("/volunteers")
    return { success: true }
  } catch (error) {
    console.error("[invitations] Cancel error:", error)
    return { success: false, error: "Failed to cancel invitation" }
  }
}

export async function resendInvitationAction(invitationId: string) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/invitations/${invitationId}/resend`, {
      method: "POST",
      headers,
    })
    if (!res.ok) throw new Error("Failed to resend invitation")
    revalidatePath("/volunteers")
    return { success: true }
  } catch (error) {
    console.error("[invitations] Resend error:", error)
    return { success: false, error: "Failed to resend invitation" }
  }
}

export async function createMemberManuallyAction(formData: FormData) {
  try {
    const headers = await getAuthHeaders()
    const body = {
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      role: formData.get("role"),
      organizationId: formData.get("organizationId"),
      netzwerkCityId: formData.get("netzwerkCityId") || undefined,
      department: formData.get("department") || undefined,
    }
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Failed to create member")
    const data = await res.json()
    revalidatePath("/volunteers")
    return { success: true, userId: data.id }
  } catch (error) {
    console.error("[invitations] Create member error:", error)
    return { success: false, error: "Failed to create member" }
  }
}
