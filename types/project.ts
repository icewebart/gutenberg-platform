export interface Project {
  id: string
  organizationId: string
  netzwerkCityId?: string
  title: string
  shortDescription: string
  longDescription: string
  projectDate: string
  startDate?: string
  endDate?: string
  location: string
  imageUrl?: string
  projectManagerId?: string
  projectType: "sommerschule" | "wintercamp" | "workshop" | "event" | "other"
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  maxParticipants?: number
  currentParticipants: number
  pointsReward: number
  requirements?: string[]
  materials?: string[]
  images?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: "manager" | "member" | "participant"
  joinedAt: string
}

export interface ProjectWithMembers extends Project {
  projectManager?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  members: Array<{
    id: string
    name: string
    email: string
    avatar?: string
    role: string
  }>
}

export interface CreateProjectData {
  title: string
  shortDescription: string
  longDescription: string
  projectDate: string
  startDate?: string
  endDate?: string
  location: string
  imageUrl?: string
  projectManagerId?: string
  projectType: string
  status: string
  maxParticipants?: number
  pointsReward: number
  requirements?: string[]
  materials?: string[]
  memberIds?: string[]
  organizationId: string
  netzwerkCityId?: string
}
