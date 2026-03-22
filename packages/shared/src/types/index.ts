// ─── Organizations & Cities ─────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  domain: string
  settings: {
    allowRegistration: boolean
    requireApproval: boolean
    defaultRole: "volunteer" | "participant"
  }
  createdAt: string
  updatedAt: string
}

export interface NetzwerkCity {
  id: string
  name: string
  country: string
  organizationId: string
  coordinators: string[]
  projects: string[]
  createdAt: string
}

// ─── Users ──────────────────────────────────────────────────────────────────

export type UserRole = "volunteer" | "participant" | "board_member" | "admin"
export type UserDepartment = "HR" | "PR" | "FR" | "AB" | "Board" | "Alumni" | "None"
export type UserStatus = "online" | "away" | "offline"

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  department: UserDepartment
  organizationId: string
  netzwerkCityId?: string
  permissions: string[]
  avatar?: string
  isActive: boolean
  isVerified: boolean
  status: UserStatus
  lastLogin?: string
  createdAt: string
  yearsOfActivity: number[]
  profile: {
    bio?: string
    location?: string
    skills: string[]
    interests: string[]
    availability: string
    address?: string
    socialLinks?: {
      linkedin?: string
      facebook?: string
      instagram?: string
      tiktok?: string
    }
    wasMemberInNetzwerk?: boolean
  }
  gamification: {
    points: number
    level: number
    badges: string[]
    achievements: string[]
  }
  projectHistory: ProjectParticipation[]
  activityLog: ActivityLog[]
  pointsHistory: PointsHistory[]
  watchedCourses: WatchedCourse[]
  enrolledCourses: string[]
}

// ─── Projects ────────────────────────────────────────────────────────────────

export type ProjectType = "sommerschule" | "wintercamp" | "workshop" | "event" | "other"
export type ProjectStatus = "upcoming" | "ongoing" | "completed" | "cancelled"
export type ProjectRole = "manager" | "member" | "participant"

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
  projectType: ProjectType
  status: ProjectStatus
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
  role: ProjectRole
  joinedAt: string
}

export interface ProjectWithMembers extends Project {
  projectManager?: { id: string; name: string; email: string; avatar?: string }
  members: Array<{ id: string; name: string; email: string; avatar?: string; role: string }>
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

export interface ProjectParticipation {
  projectId: string
  projectName: string
  role: string
  year: number
}

// ─── Activity & Gamification ─────────────────────────────────────────────────

export interface ActivityLog {
  id: string
  title: string
  description: string
  points: number
  date: string
  projectType: string
  roleInProject: string
  projectId?: string
}

export interface PointsHistory {
  id: string
  date: string
  reason: string
  points: number
  type: "earned" | "redeemed"
}

export interface WatchedCourse {
  courseId: string
  courseTitle: string
  completedDate: string
  pointsEarned: number
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export interface CourseMaterial {
  id: string
  title: string
  type: "pdf" | "video" | "link" | "document"
  url: string
  description?: string
}

export interface QuizQuestion {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "short_answer"
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  passingScore: number
}

export interface CourseModule {
  id: string
  title: string
  description: string
  content: string
  videoUrl?: string
  materials: CourseMaterial[]
  quiz?: Quiz
  order: number
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  difficulty: "beginner" | "intermediate" | "advanced"
  category: string
  organizationId: string
  modules: CourseModule[]
  enrolledUsers: string[]
  completedUsers: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface CommunityReply {
  id: string
  content: string
  authorId: string
  postId: string
  parentReplyId?: string
  likes: number
  createdAt: string
  updatedAt: string
}

export interface CommunityPost {
  id: string
  title: string
  content: string
  authorId: string
  organizationId: string
  category: string
  tags: string[]
  likes: number
  replies: CommunityReply[]
  isPinned: boolean
  isModerated: boolean
  createdAt: string
  updatedAt: string
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface ChatConversation {
  id: string
  participants: string[]
  messages: ChatMessage[]
  createdAt: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface LoginResponse {
  user: Omit<User, "enrolledCourses" | "watchedCourses" | "activityLog" | "pointsHistory" | "projectHistory">
  token: string
}
