import type { User } from "@/types/organization"

export interface CommunityReply {
  id: string
  content: string
  author: User
  createdAt: string
  likes: number
  likedBy: string[]
  replies?: CommunityReply[]
  isAccepted?: boolean
}

export interface CommunityPost {
  id: string
  title: string
  content: string
  author: User
  category: string
  tags: string[]
  createdAt: string
  likes: number
  likedBy: string[]
  replies: CommunityReply[]
  views: number
  isPinned: boolean
  isLocked: boolean
  isResolved?: boolean
}

// Mock data for community posts
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "post-1",
    title: "Welcome to the Gutenberg Community!",
    content:
      "This is our new community forum where we can share ideas, ask questions, and collaborate on projects. Feel free to introduce yourself and let us know what you're working on!",
    author: {
      id: "user-4",
      name: "Dr. Alex Chen",
      email: "admin@gutenberg.edu",
      role: "admin",
      organizationId: "org-1",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 5000,
      permissions: ["*"],
      phone: "+1 (555) 456-7890",
      location: "Frankfurt, Germany",
      bio: "System administrator and faculty advisor for student organizations.",
      joinDate: "2020-01-15",
      isVerified: true,
      tags: ["administration", "faculty", "system-management"],
      yearsOfActivity: [2020, 2021, 2022, 2023, 2024],
      lastActive: "15 minutes ago",
      status: "online",
    },
    category: "announcements",
    tags: ["welcome", "community", "introduction"],
    createdAt: "2024-01-15T10:00:00Z",
    likes: 25,
    likedBy: ["user-1", "user-2", "user-3"],
    replies: [
      {
        id: "reply-1",
        content: "Thanks for setting this up! I'm excited to connect with other volunteers and share project ideas.",
        author: {
          id: "user-1",
          name: "Emma Thompson",
          email: "emma.thompson@gutenberg.edu",
          role: "volunteer",
          organizationId: "org-1",
          netzwerkCityId: "city-1",
          avatar: "/placeholder.svg?height=40&width=40",
          points: 1250,
          permissions: [
            "view_projects",
            "join_projects",
            "view_community",
            "post_community",
            "view_store",
            "redeem_items",
          ],
          phone: "+1 (555) 123-4567",
          location: "Berlin, Germany",
          bio: "Computer Science student passionate about open source projects and community building.",
          joinDate: "2023-09-01",
          isVerified: true,
          tags: ["web-development", "open-source", "mentoring"],
          yearsOfActivity: [2023, 2024],
          lastActive: "2 hours ago",
          status: "online",
        },
        createdAt: "2024-01-15T11:30:00Z",
        likes: 8,
        likedBy: ["user-2", "user-4"],
      },
    ],
    views: 156,
    isPinned: true,
    isLocked: false,
  },
  {
    id: "post-2",
    title: "Looking for Web Development Volunteers",
    content:
      "We're starting a new project to build a student resource portal and need volunteers with web development skills. The project will use React, Node.js, and PostgreSQL. If you're interested or have questions, please let me know!",
    author: {
      id: "user-2",
      name: "Marcus Johnson",
      email: "marcus.j@gutenberg.edu",
      role: "board_member",
      organizationId: "org-1",
      netzwerkCityId: "city-1",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 2890,
      permissions: [
        "view_projects",
        "create_projects",
        "manage_projects",
        "view_volunteers",
        "assign_volunteers",
        "add_activities",
        "view_community",
        "moderate_community",
        "view_store",
        "manage_netzwerk",
      ],
      phone: "+1 (555) 234-5678",
      location: "Berlin, Germany",
      bio: "Design enthusiast and volunteer coordinator. Helping students connect and grow through creative projects.",
      joinDate: "2022-01-15",
      isVerified: true,
      tags: ["design", "coordination", "leadership"],
      yearsOfActivity: [2022, 2023, 2024],
      lastActive: "1 hour ago",
      status: "online",
    },
    category: "projects",
    tags: ["web-development", "react", "nodejs", "volunteers"],
    createdAt: "2024-01-14T14:20:00Z",
    likes: 12,
    likedBy: ["user-1", "user-3"],
    replies: [
      {
        id: "reply-2",
        content: "I'd love to help! I have experience with React and Node.js. When do you plan to start?",
        author: {
          id: "user-1",
          name: "Emma Thompson",
          email: "emma.thompson@gutenberg.edu",
          role: "volunteer",
          organizationId: "org-1",
          netzwerkCityId: "city-1",
          avatar: "/placeholder.svg?height=40&width=40",
          points: 1250,
          permissions: [
            "view_projects",
            "join_projects",
            "view_community",
            "post_community",
            "view_store",
            "redeem_items",
          ],
          phone: "+1 (555) 123-4567",
          location: "Berlin, Germany",
          bio: "Computer Science student passionate about open source projects and community building.",
          joinDate: "2023-09-01",
          isVerified: true,
          tags: ["web-development", "open-source", "mentoring"],
          yearsOfActivity: [2023, 2024],
          lastActive: "2 hours ago",
          status: "online",
        },
        createdAt: "2024-01-14T15:45:00Z",
        likes: 3,
        likedBy: ["user-2"],
      },
    ],
    views: 89,
    isPinned: false,
    isLocked: false,
  },
  {
    id: "post-3",
    title: "Question about Course Certificates",
    content:
      "Hi everyone! I completed the 'Introduction to Project Management' course last week, but I haven't received my certificate yet. How long does it usually take? Thanks!",
    author: {
      id: "user-3",
      name: "Sofia Rodriguez",
      email: "sofia.rodriguez@gutenberg.edu",
      role: "participant",
      organizationId: "org-1",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 450,
      permissions: ["view_assigned_projects", "view_community", "view_learning_center"],
      phone: "+1 (555) 345-6789",
      location: "Munich, Germany",
      bio: "Participated in multiple workshops and camps. Interested in personal development.",
      joinDate: "2023-06-01",
      isVerified: true,
      tags: ["workshops", "personal-development"],
      yearsOfActivity: [2023, 2024],
      lastActive: "30 minutes ago",
      status: "online",
    },
    category: "questions",
    tags: ["certificates", "courses", "learning"],
    createdAt: "2024-01-13T09:15:00Z",
    likes: 5,
    likedBy: ["user-1", "user-2"],
    replies: [
      {
        id: "reply-3",
        content:
          "Certificates are usually generated within 24-48 hours after course completion. If you don't see it by tomorrow, please contact support!",
        author: {
          id: "user-4",
          name: "Dr. Alex Chen",
          email: "admin@gutenberg.edu",
          role: "admin",
          organizationId: "org-1",
          avatar: "/placeholder.svg?height=40&width=40",
          points: 5000,
          permissions: ["*"],
          phone: "+1 (555) 456-7890",
          location: "Frankfurt, Germany",
          bio: "System administrator and faculty advisor for student organizations.",
          joinDate: "2020-01-15",
          isVerified: true,
          tags: ["administration", "faculty", "system-management"],
          yearsOfActivity: [2020, 2021, 2022, 2023, 2024],
          lastActive: "15 minutes ago",
          status: "online",
        },
        createdAt: "2024-01-13T10:30:00Z",
        likes: 7,
        likedBy: ["user-1", "user-3"],
        isAccepted: true,
      },
    ],
    views: 67,
    isPinned: false,
    isLocked: false,
    isResolved: true,
  },
]
