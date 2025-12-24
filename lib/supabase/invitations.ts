import { createServerClient } from "./server"
import { v4 as uuidv4 } from "uuid"

export interface CreateInvitationData {
  email: string
  name?: string
  role: "volunteer" | "participant" | "board_member"
  organizationId: string
  netzwerkCityId?: string
  department?: string
}

export interface Invitation {
  id: string
  email: string
  name?: string
  role: string
  organizationId: string
  netzwerkCityId?: string
  department?: string
  invitedBy: string
  invitationToken: string
  status: "pending" | "accepted" | "expired" | "cancelled"
  expiresAt: string
  acceptedAt?: string
  createdAt: string
}

export async function createInvitation(data: CreateInvitationData, invitedById: string): Promise<Invitation> {
  const supabase = await createServerClient()

  // Generate unique invitation token
  const invitationToken = uuidv4()

  // Set expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({
      email: data.email,
      name: data.name,
      role: data.role,
      organization_id: data.organizationId,
      netzwerk_city_id: data.netzwerkCityId,
      department: data.department,
      invited_by: invitedById,
      invitation_token: invitationToken,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating invitation:", error)
    throw new Error("Failed to create invitation")
  }

  return {
    id: invitation.id,
    email: invitation.email,
    name: invitation.name,
    role: invitation.role,
    organizationId: invitation.organization_id,
    netzwerkCityId: invitation.netzwerk_city_id,
    department: invitation.department,
    invitedBy: invitation.invited_by,
    invitationToken: invitation.invitation_token,
    status: invitation.status,
    expiresAt: invitation.expires_at,
    acceptedAt: invitation.accepted_at,
    createdAt: invitation.created_at,
  }
}

export async function getInvitationsByOrganization(organizationId: string): Promise<Invitation[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching invitations:", error)
    throw new Error("Failed to fetch invitations")
  }

  return (
    data?.map((inv) => ({
      id: inv.id,
      email: inv.email,
      name: inv.name,
      role: inv.role,
      organizationId: inv.organization_id,
      netzwerkCityId: inv.netzwerk_city_id,
      department: inv.department,
      invitedBy: inv.invited_by,
      invitationToken: inv.invitation_token,
      status: inv.status,
      expiresAt: inv.expires_at,
      acceptedAt: inv.accepted_at,
      createdAt: inv.created_at,
    })) || []
  )
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("invitations").select("*").eq("invitation_token", token).single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    organizationId: data.organization_id,
    netzwerkCityId: data.netzwerk_city_id,
    department: data.department,
    invitedBy: data.invited_by,
    invitationToken: data.invitation_token,
    status: data.status,
    expiresAt: data.expires_at,
    acceptedAt: data.accepted_at,
    createdAt: data.created_at,
  }
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase.from("invitations").update({ status: "cancelled" }).eq("id", invitationId)

  if (error) {
    console.error("[v0] Error cancelling invitation:", error)
    throw new Error("Failed to cancel invitation")
  }
}

export async function resendInvitation(invitationId: string): Promise<Invitation> {
  const supabase = await createServerClient()

  // Extend expiration by 7 days
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data, error } = await supabase
    .from("invitations")
    .update({
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .eq("id", invitationId)
    .select()
    .single()

  if (error || !data) {
    throw new Error("Failed to resend invitation")
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    organizationId: data.organization_id,
    netzwerkCityId: data.netzwerk_city_id,
    department: data.department,
    invitedBy: data.invited_by,
    invitationToken: data.invitation_token,
    status: data.status,
    expiresAt: data.expires_at,
    acceptedAt: data.accepted_at,
    createdAt: data.created_at,
  }
}
