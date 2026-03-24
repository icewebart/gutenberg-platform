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
  organizationId: z.string().uuid().optional(),
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
  longDescription: z.string().min(10),
  projectDate: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().min(2),
  imageUrl: z.string().url().optional().or(z.literal("")),
  projectManagerId: z.string().uuid().optional().or(z.literal("")),
  projectType: z.enum([
    "camp", "conference", "online", "workshop", "training",
    "study_visit", "youth_exchange", "sommerschule", "wintercamp", "event", "other",
  ]),
  status: z.enum(["draft", "upcoming", "ongoing", "completed", "cancelled"]),
  visibility: z.enum(["internal", "public"]).optional(),
  maxParticipants: z.number().int().positive().optional(),
  expectedParticipants: z.number().int().positive().optional(),
  pointsReward: z.number().int().min(0),
  category: z.enum(["education", "culture", "environment", "social", "sport", "other"]).optional(),
  scale: z.enum(["local", "national", "european", "international"]).optional(),
  funding: z.enum(["self_funded", "erasmus_plus", "national_grant", "sponsored", "other"]).optional(),
  goals: z.array(z.string()).optional(),
  kpis: z.array(z.string()).optional(),
  partnerOrganizations: z.array(z.string()).optional(),
  budget: z.number().int().min(0).optional(),
  currency: z.string().optional(),
  registrationLink: z.string().url().optional().or(z.literal("")),
  requirements: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  memberIds: z.array(z.string().uuid()).optional(),
  organizationId: z.string().uuid(),
  netzwerkCityId: z.string().uuid().optional(),
  // Registration / Stripe
  registrationEnabled: z.boolean().optional(),
  applicationFee: z.number().int().min(0).optional(),
  autoApprove: z.boolean().optional(),
  formFields: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["text", "email", "phone", "textarea", "select", "checkbox"]),
      label: z.string(),
      required: z.boolean(),
      options: z.array(z.string()),
    })
  ).optional(),
  stripeProductId: z.string().optional(),
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
