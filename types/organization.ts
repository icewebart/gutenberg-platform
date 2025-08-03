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

export interface ProjectParticipation {
  projectId: string
  projectName: string
  role: string
  year: number
}

export type ProjectType =
  | "Sommerschule"
  | "Karawane"
  | "Wintercamp"
  | "Recrutierungen"
  | "Netzwerk"
  | "Eu-Projekt"
  | "Andere"
export type ProjectRole = "Volunteer" | "Project Manager" | "Project Assistant" | "Project Mentor" | "Other"

export interface ActivityLog {
  id: string
  title: string
  description: string
  points: number
  date: string
  projectType: ProjectType
  roleInProject: ProjectRole
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

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "volunteer" | "participant" | "board_member" | "admin"
  department: "HR" | "PR" | "FR" | "AB" | "Board" | "Alumni" | "None"
  organizationId: string
  netzwerkCityId?: string
  permissions: string[]
  avatar?: string
  isActive: boolean
  isVerified: boolean
  status: "online" | "away" | "offline"
  lastLogin?: string
  createdAt: string // Join date
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

export interface Project {
  id: string
  title: string
  description: string
  status: "planning" | "active" | "completed" | "on_hold"
  priority: "low" | "medium" | "high" | "urgent"
  organizationId: string
  netzwerkCityId?: string
  managerId: string
  assignedVolunteers: string[]
  participants: string[]
  startDate: string
  endDate?: string
  budget?: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number // in minutes
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

export interface CourseModule {
  id: string
  title: string
  description: string
  content: string // Markdown content
  videoUrl?: string
  materials: CourseMaterial[]
  quiz?: Quiz
  order: number
}

export interface CourseMaterial {
  id: string
  title: string
  type: "pdf" | "video" | "link" | "document"
  url: string
  description?: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  passingScore: number
}

export interface QuizQuestion {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "short_answer"
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
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

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface ChatConversation {
  id: string
  participants: string[] // array of user IDs
  messages: ChatMessage[]
}
