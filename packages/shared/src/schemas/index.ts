import { z } from "zod"

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["volunteer", "participant"]).optional(),
  organizationId: z.string().uuid(),
  netzwerkCityId: z.string().uuid().optional(),
})

// ─── Users ───────────────────────────────────────────────────────────────────

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.enum(["HR", "PR", "FR", "AB", "Board", "Alumni", "None"]).optional(),
  netzwerkCityId: z.string().uuid().optional().nullable(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().optional(),
  profile: z.object({
    bio: z.string().optional(),
    location: z.string().optional(),
    skills: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    availability: z.string().optional(),
    address: z.string().optional(),
    socialLinks: z.object({
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
    }).optional(),
  }).optional(),
})

export const addPointsSchema = z.object({
  points: z.number().int(),
  reason: z.string().min(1),
  type: z.enum(["earned", "redeemed"]),
})

// ─── Projects ────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  title: z.string().min(2),
  shortDescription: z.string().min(10),
  longDescription: z.string().min(20),
  projectDate: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().min(2),
  imageUrl: z.string().url().optional(),
  projectManagerId: z.string().uuid().optional(),
  projectType: z.enum(["sommerschule", "wintercamp", "workshop", "event", "other"]),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]),
  maxParticipants: z.number().int().positive().optional(),
  pointsReward: z.number().int().min(0),
  requirements: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  memberIds: z.array(z.string().uuid()).optional(),
  organizationId: z.string().uuid(),
  netzwerkCityId: z.string().uuid().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

// ─── Community ────────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(10),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  organizationId: z.string().uuid(),
})

export const createReplySchema = z.object({
  content: z.string().min(1),
  parentReplyId: z.string().uuid().optional(),
})

// ─── Courses ─────────────────────────────────────────────────────────────────

export const createCourseSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  instructor: z.string().min(2),
  duration: z.number().int().positive(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.string().min(1),
  organizationId: z.string().uuid(),
  isPublished: z.boolean().optional(),
})
