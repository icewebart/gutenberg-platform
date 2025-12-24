import { createServerClient } from "@/lib/supabase/server"
import type { ProjectWithMembers, CreateProjectData } from "@/types/project"

export async function createProject(data: CreateProjectData, userId: string) {
  const supabase = await createServerClient()

  // Insert project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      organization_id: data.organizationId,
      netzwerk_city_id: data.netzwerkCityId,
      title: data.title,
      short_description: data.shortDescription,
      long_description: data.longDescription,
      project_date: data.projectDate,
      start_date: data.startDate,
      end_date: data.endDate,
      location: data.location,
      image_url: data.imageUrl,
      project_manager_id: data.projectManagerId,
      project_type: data.projectType,
      status: data.status,
      max_participants: data.maxParticipants,
      points_reward: data.pointsReward,
      requirements: data.requirements,
      materials: data.materials,
      created_by: userId,
    })
    .select()
    .single()

  if (projectError) {
    console.error("[v0] Error creating project:", projectError)
    throw new Error("Failed to create project")
  }

  // Add project manager as a member
  if (data.projectManagerId && project.id) {
    const { error: managerError } = await supabase.from("project_members").insert({
      project_id: project.id,
      user_id: data.projectManagerId,
      role: "manager",
    })

    if (managerError) {
      console.error("[v0] Error adding project manager:", managerError)
    }
  }

  // Add additional members
  if (data.memberIds && data.memberIds.length > 0 && project.id) {
    const memberRecords = data.memberIds.map((memberId) => ({
      project_id: project.id,
      user_id: memberId,
      role: "member",
    }))

    const { error: membersError } = await supabase.from("project_members").insert(memberRecords)

    if (membersError) {
      console.error("[v0] Error adding project members:", membersError)
    }
  }

  return project
}

export async function getProjects(organizationId: string): Promise<ProjectWithMembers[]> {
  const supabase = await createServerClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      project_manager:users!projects_project_manager_id_fkey(id, name, email, avatar),
      project_members(
        user_id,
        role,
        user:users(id, name, email, avatar)
      )
    `,
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching projects:", error)
    throw new Error("Failed to fetch projects")
  }

  // Transform the data to match ProjectWithMembers interface
  return (
    projects?.map((project) => ({
      id: project.id,
      organizationId: project.organization_id,
      netzwerkCityId: project.netzwerk_city_id,
      title: project.title,
      shortDescription: project.short_description,
      longDescription: project.long_description,
      projectDate: project.project_date,
      startDate: project.start_date,
      endDate: project.end_date,
      location: project.location,
      imageUrl: project.image_url,
      projectManagerId: project.project_manager_id,
      projectType: project.project_type,
      status: project.status,
      maxParticipants: project.max_participants,
      currentParticipants: project.current_participants,
      pointsReward: project.points_reward,
      requirements: project.requirements,
      materials: project.materials,
      images: project.images,
      createdBy: project.created_by,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      projectManager: project.project_manager,
      members:
        project.project_members?.map((pm: any) => ({
          ...pm.user,
          role: pm.role,
        })) || [],
    })) || []
  )
}

export async function getProjectById(projectId: string): Promise<ProjectWithMembers | null> {
  const supabase = await createServerClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      project_manager:users!projects_project_manager_id_fkey(id, name, email, avatar),
      project_members(
        user_id,
        role,
        user:users(id, name, email, avatar)
      )
    `,
    )
    .eq("id", projectId)
    .single()

  if (error) {
    console.error("[v0] Error fetching project:", error)
    return null
  }

  return {
    id: project.id,
    organizationId: project.organization_id,
    netzwerkCityId: project.netzwerk_city_id,
    title: project.title,
    shortDescription: project.short_description,
    longDescription: project.long_description,
    projectDate: project.project_date,
    startDate: project.start_date,
    endDate: project.end_date,
    location: project.location,
    imageUrl: project.image_url,
    projectManagerId: project.project_manager_id,
    projectType: project.project_type,
    status: project.status,
    maxParticipants: project.max_participants,
    currentParticipants: project.current_participants,
    pointsReward: project.points_reward,
    requirements: project.requirements,
    materials: project.materials,
    images: project.images,
    createdBy: project.created_by,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    projectManager: project.project_manager,
    members:
      project.project_members?.map((pm: any) => ({
        ...pm.user,
        role: pm.role,
      })) || [],
  }
}

export async function updateProject(projectId: string, data: Partial<CreateProjectData>) {
  const supabase = await createServerClient()

  const updateData: any = {}
  if (data.title) updateData.title = data.title
  if (data.shortDescription) updateData.short_description = data.shortDescription
  if (data.longDescription) updateData.long_description = data.longDescription
  if (data.projectDate) updateData.project_date = data.projectDate
  if (data.startDate) updateData.start_date = data.startDate
  if (data.endDate) updateData.end_date = data.endDate
  if (data.location) updateData.location = data.location
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl
  if (data.projectManagerId !== undefined) updateData.project_manager_id = data.projectManagerId
  if (data.projectType) updateData.project_type = data.projectType
  if (data.status) updateData.status = data.status
  if (data.maxParticipants !== undefined) updateData.max_participants = data.maxParticipants
  if (data.pointsReward !== undefined) updateData.points_reward = data.pointsReward
  if (data.requirements !== undefined) updateData.requirements = data.requirements
  if (data.materials !== undefined) updateData.materials = data.materials

  const { data: project, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating project:", error)
    throw new Error("Failed to update project")
  }

  return project
}

export async function deleteProject(projectId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("projects").delete().eq("id", projectId)

  if (error) {
    console.error("[v0] Error deleting project:", error)
    throw new Error("Failed to delete project")
  }

  return { success: true }
}

export async function addProjectMember(projectId: string, userId: string, role = "member") {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error adding project member:", error)
    throw new Error("Failed to add project member")
  }

  // Update current participants count
  const { error: updateError } = await supabase.rpc("increment_project_participants", { project_id: projectId })

  return data
}

export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("project_members").delete().eq("project_id", projectId).eq("user_id", userId)

  if (error) {
    console.error("[v0] Error removing project member:", error)
    throw new Error("Failed to remove project member")
  }

  return { success: true }
}

export async function getVolunteers(organizationId: string) {
  const supabase = await createServerClient()

  const { data: volunteers, error } = await supabase
    .from("users")
    .select("id, name, email, avatar, role, department")
    .eq("organization_id", organizationId)
    .in("role", ["volunteer", "board_member", "admin"])
    .order("name")

  if (error) {
    console.error("[v0] Error fetching volunteers:", error)
    throw new Error("Failed to fetch volunteers")
  }

  return volunteers || []
}
