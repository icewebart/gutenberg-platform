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

export async function createProjectAction(formData: FormData) {
  try {
    const headers = await getAuthHeaders()
    const requirementsStr = formData.get("requirements") as string
    const materialsStr = formData.get("materials") as string
    const memberIdsStr = formData.get("memberIds") as string
    const body = {
      title: formData.get("title"),
      shortDescription: formData.get("shortDescription"),
      longDescription: formData.get("longDescription"),
      projectDate: formData.get("projectDate"),
      startDate: formData.get("startDate") || undefined,
      endDate: formData.get("endDate") || undefined,
      location: formData.get("location"),
      imageUrl: formData.get("imageUrl") || undefined,
      projectManagerId: formData.get("projectManagerId") || undefined,
      projectType: formData.get("projectType"),
      status: formData.get("status") || "upcoming",
      maxParticipants: formData.get("maxParticipants")
        ? parseInt(formData.get("maxParticipants") as string)
        : undefined,
      pointsReward: parseInt(formData.get("pointsReward") as string) || 0,
      organizationId: formData.get("organizationId"),
      netzwerkCityId: formData.get("netzwerkCityId") || undefined,
      requirements: requirementsStr
        ? requirementsStr.split(",").map((r) => r.trim()).filter(Boolean)
        : undefined,
      materials: materialsStr
        ? materialsStr.split(",").map((m) => m.trim()).filter(Boolean)
        : undefined,
      memberIds: memberIdsStr
        ? memberIdsStr.split(",").map((id) => id.trim()).filter(Boolean)
        : undefined,
    }
    const res = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Failed to create project")
    const data = await res.json()
    revalidatePath("/projects")
    return { success: true, projectId: data.id }
  } catch (error) {
    console.error("[projects] Create error:", error)
    return { success: false, error: "Failed to create project" }
  }
}

export async function updateProjectAction(projectId: string, formData: FormData) {
  try {
    const headers = await getAuthHeaders()
    const requirementsStr = formData.get("requirements") as string
    const materialsStr = formData.get("materials") as string
    const body = {
      title: formData.get("title"),
      shortDescription: formData.get("shortDescription"),
      longDescription: formData.get("longDescription"),
      projectDate: formData.get("projectDate"),
      startDate: formData.get("startDate") || undefined,
      endDate: formData.get("endDate") || undefined,
      location: formData.get("location"),
      imageUrl: formData.get("imageUrl") || undefined,
      projectManagerId: formData.get("projectManagerId") || undefined,
      projectType: formData.get("projectType"),
      status: formData.get("status"),
      maxParticipants: formData.get("maxParticipants")
        ? parseInt(formData.get("maxParticipants") as string)
        : undefined,
      pointsReward: parseInt(formData.get("pointsReward") as string) || 0,
      requirements: requirementsStr
        ? requirementsStr.split(",").map((r) => r.trim()).filter(Boolean)
        : undefined,
      materials: materialsStr
        ? materialsStr.split(",").map((m) => m.trim()).filter(Boolean)
        : undefined,
    }
    const res = await fetch(`${API_URL}/projects/${projectId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Failed to update project")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[projects] Update error:", error)
    return { success: false, error: "Failed to update project" }
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers,
    })
    if (!res.ok) throw new Error("Failed to delete project")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[projects] Delete error:", error)
    return { success: false, error: "Failed to delete project" }
  }
}

export async function joinProjectAction(projectId: string) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/projects/${projectId}/join`, {
      method: "POST",
      headers,
    })
    if (!res.ok) throw new Error("Failed to join project")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[projects] Join error:", error)
    return { success: false, error: "Failed to join project" }
  }
}

export async function leaveProjectAction(projectId: string) {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}/projects/${projectId}/leave`, {
      method: "POST",
      headers,
    })
    if (!res.ok) throw new Error("Failed to leave project")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[projects] Leave error:", error)
    return { success: false, error: "Failed to leave project" }
  }
}
