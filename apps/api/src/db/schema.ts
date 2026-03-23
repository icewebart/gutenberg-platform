import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core"

// ─── Organizations ────────────────────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  type: text("type").notNull().default("student_organization"),
  settings: jsonb("settings").notNull().default({
    allowRegistration: true,
    requireApproval: false,
    defaultRole: "volunteer",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Netzwerk Cities ──────────────────────────────────────────────────────────

export const netzwerkCities = pgTable("netzwerk_cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  coordinators: jsonb("coordinators").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: text("role").notNull().default("volunteer"),
  department: text("department").notNull().default("None"),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  netzwerkCityId: uuid("netzwerk_city_id").references(() => netzwerkCities.id, {
    onDelete: "set null",
  }),
  permissions: jsonb("permissions").notNull().default([]),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  status: text("status").notNull().default("offline"),
  lastLogin: timestamp("last_login"),
  yearsOfActivity: jsonb("years_of_activity").notNull().default([]),
  profile: jsonb("profile").notNull().default({
    skills: [],
    interests: [],
    availability: "flexible",
  }),
  gamification: jsonb("gamification").notNull().default({
    points: 0,
    level: 1,
    badges: [],
    achievements: [],
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  netzwerkCityId: uuid("netzwerk_city_id").references(() => netzwerkCities.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull(),
  longDescription: text("long_description").notNull(),
  projectDate: text("project_date").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  projectManagerId: uuid("project_manager_id").references(() => users.id, {
    onDelete: "set null",
  }),
  projectType: text("project_type").notNull().default("event"),
  status: text("status").notNull().default("upcoming"),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").notNull().default(0),
  pointsReward: integer("points_reward").notNull().default(0),
  requirements: jsonb("requirements").notNull().default([]),
  materials: jsonb("materials").notNull().default([]),
  images: jsonb("images").notNull().default([]),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const projectMembers = pgTable("project_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("participant"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
})

// ─── Courses ─────────────────────────────────────────────────────────────────

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  duration: integer("duration").notNull().default(0),
  difficulty: text("difficulty").notNull().default("beginner"),
  category: text("category").notNull(),
  modules: jsonb("modules").notNull().default([]),
  enrolledUsers: jsonb("enrolled_users").notNull().default([]),
  completedUsers: jsonb("completed_users").notNull().default([]),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Community ────────────────────────────────────────────────────────────────

export const communityPosts = pgTable("community_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").notNull().default([]),
  likes: integer("likes").notNull().default(0),
  isPinned: boolean("is_pinned").notNull().default(false),
  isModerated: boolean("is_moderated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const communityReplies = pgTable("community_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentReplyId: uuid("parent_reply_id"),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  participants: jsonb("participants").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("todo"), // todo | in_progress | done
  priority: text("priority").notNull().default("medium"), // low | medium | high
  deadline: timestamp("deadline"),
  points: integer("points").notNull().default(0),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  completedAt: timestamp("completed_at"),
  pointsAwarded: boolean("points_awarded").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Invitations ─────────────────────────────────────────────────────────────

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("volunteer"),
  token: text("token").notNull().unique(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
