"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import {
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from "@/lib/supabase/projects"
import type { CreateProjectData } from "@/types/project"

export async function createProjectAction(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const projectData: CreateProjectData = {
    title: formData.get("title") as string,
    shortDescription: formData.get("shortDescription") as string,
    longDescription: formData.get("longDescription") as string,
    projectDate: formData.get("projectDate") as string,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    location: formData.get("location") as string,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    projectManagerId: (formData.get("projectManagerId") as string) || undefined,
    projectType: formData.get("projectType") as string,
    status: (formData.get("status") as string) || "upcoming",
    maxParticipants: formData.get("maxParticipants")
      ? Number.parseInt(formData.get("maxParticipants") as string)
      : undefined,
    pointsReward: Number.parseInt(formData.get("pointsReward") as string) || 0,
    organizationId: formData.get("organizationId") as string,
    netzwerkCityId: (formData.get("netzwerkCityId") as string) || undefined,
  }

  // Parse arrays
  const requirementsStr = formData.get("requirements") as string
  if (requirementsStr) {
    projectData.requirements = requirementsStr
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
  }

  const materialsStr = formData.get("materials") as string
  if (materialsStr) {
    projectData.materials = materialsStr
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)
  }

  const memberIdsStr = formData.get("memberIds") as string
  if (memberIdsStr) {
    projectData.memberIds = memberIdsStr
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  }

  try {
    const project = await createProject(projectData, user.id)
    revalidatePath("/projects")
    return { success: true, projectId: project.id }
  } catch (error) {
    console.error("[v0] Create project error:", error)
    return { success: false, error: "Failed to create project" }
  }
}

export async function updateProjectAction(projectId: string, formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const projectData: Partial<CreateProjectData> = {
    title: formData.get("title") as string,
    shortDescription: formData.get("shortDescription") as string,
    longDescription: formData.get("longDescription") as string,
    projectDate: formData.get("projectDate") as string,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    location: formData.get("location") as string,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    projectManagerId: (formData.get("projectManagerId") as string) || undefined,
    projectType: formData.get("projectType") as string,
    status: formData.get("status") as string,
    maxParticipants: formData.get("maxParticipants")
      ? Number.parseInt(formData.get("maxParticipants") as string)
      : undefined,
    pointsReward: Number.parseInt(formData.get("pointsReward") as string) || 0,
  }

  // Parse arrays
  const requirementsStr = formData.get("requirements") as string
  if (requirementsStr) {
    projectData.requirements = requirementsStr
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)
  }

  const materialsStr = formData.get("materials") as string
  if (materialsStr) {
    projectData.materials = materialsStr
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)
  }

  try {
    await updateProject(projectId, projectData)
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update project error:", error)
    return { success: false, error: "Failed to update project" }
  }
}

export async function deleteProjectAction(projectId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    await deleteProject(projectId)
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Delete project error:", error)
    return { success: false, error: "Failed to delete project" }
  }
}

export async function joinProjectAction(projectId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    await addProjectMember(projectId, user.id, "participant")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Join project error:", error)
    return { success: false, error: "Failed to join project" }
  }
}

export async function leaveProjectAction(projectId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    await removeProjectMember(projectId, user.id)
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Leave project error:", error)
    return { success: false, error: "Failed to leave project" }
  }
}
