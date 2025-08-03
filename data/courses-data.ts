import type { Course } from "@/types/organization"

export const courseDifficulties = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
]

export const courseCategories = [
  { value: "programming", label: "Programming", icon: "💻" },
  { value: "design", label: "Design", icon: "🎨" },
  { value: "leadership", label: "Leadership", icon: "👥" },
  { value: "communication", label: "Communication", icon: "💬" },
  { value: "project-management", label: "Project Management", icon: "📊" },
  { value: "personal-development", label: "Personal Development", icon: "🌱" },
  { value: "technical-skills", label: "Technical Skills", icon: "🔧" },
  { value: "soft-skills", label: "Soft Skills", icon: "🤝" },
]

export const mockCourses: Course[] = [
  {
    id: "course-1",
    organizationId: "org-1",
    title: "Introduction to Web Development",
    description:
      "Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications. This comprehensive course covers everything from basic syntax to advanced concepts like responsive design and DOM manipulation.",
    content: `# Introduction to Web Development

## Course Overview
This course will teach you the fundamentals of web development, covering HTML, CSS, and JavaScript.

## Learning Objectives
- Understand HTML structure and semantics
- Master CSS styling and layout techniques
- Learn JavaScript programming fundamentals
- Build responsive web applications
- Implement interactive user interfaces

## Course Structure
### Module 1: HTML Fundamentals
- HTML document structure
- Semantic HTML elements
- Forms and input validation
- Accessibility best practices

### Module 2: CSS Styling
- CSS selectors and properties
- Flexbox and Grid layouts
- Responsive design principles
- CSS animations and transitions

### Module 3: JavaScript Basics
- Variables, functions, and control structures
- DOM manipulation
- Event handling
- Asynchronous programming

### Module 4: Project Development
- Planning and wireframing
- Building a complete web application
- Testing and debugging
- Deployment strategies

## Prerequisites
- Basic computer literacy
- Familiarity with text editors
- No prior programming experience required

## Resources
- Code editor (VS Code recommended)
- Modern web browser
- Access to developer tools
- Course materials and exercises`,
    duration: "6 weeks",
    difficulty: "beginner",
    category: "programming",
    instructor: "Dr. Sarah Johnson",
    visibleToRoles: ["volunteer", "participant", "board_member"],
    isPublic: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    enrolledUsers: ["user-1", "user-3"],
    completedUsers: ["user-1"],
    materials: [
      "HTML & CSS Reference Guide",
      "JavaScript Cheat Sheet",
      "Project Templates",
      "Code Examples Repository",
    ],
    videoUrl: "https://example.com/course-video-1",
    certificateEnabled: true,
  },
  {
    id: "course-2",
    organizationId: "org-1",
    title: "Advanced React Development",
    description:
      "Master React.js with hooks, context, and modern patterns. Build scalable applications with state management, routing, and performance optimization techniques.",
    content: `# Advanced React Development

## Course Overview
Take your React skills to the next level with advanced patterns, hooks, and performance optimization.

## Learning Objectives
- Master React Hooks and custom hooks
- Implement advanced state management
- Optimize React application performance
- Build scalable component architectures
- Integrate with modern development tools

## Course Structure
### Module 1: Advanced Hooks
- useEffect optimization
- Custom hooks development
- useContext and useReducer
- Performance hooks (useMemo, useCallback)

### Module 2: State Management
- Context API patterns
- Redux Toolkit integration
- Zustand for lightweight state
- Server state with React Query

### Module 3: Performance Optimization
- React.memo and optimization techniques
- Code splitting and lazy loading
- Bundle analysis and optimization
- Profiling and debugging

### Module 4: Advanced Patterns
- Compound components
- Render props and HOCs
- Error boundaries
- Suspense and concurrent features

## Prerequisites
- Solid understanding of JavaScript ES6+
- Basic React knowledge
- Experience with modern development tools
- Understanding of web development concepts

## Tools Required
- Node.js and npm/yarn
- Modern code editor
- React Developer Tools
- Git for version control`,
    duration: "8 weeks",
    difficulty: "advanced",
    category: "programming",
    instructor: "Alex Chen",
    visibleToRoles: ["volunteer", "board_member"],
    isPublic: false,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-25T16:45:00Z",
    enrolledUsers: ["user-1", "user-2"],
    completedUsers: [],
    materials: [
      "React Advanced Patterns Guide",
      "Performance Optimization Checklist",
      "State Management Comparison",
      "Real-world Project Examples",
    ],
    videoUrl: "https://example.com/course-video-2",
    certificateEnabled: true,
  },
  {
    id: "course-3",
    organizationId: "org-1",
    title: "Leadership Fundamentals",
    description:
      "Develop essential leadership skills for managing teams and projects. Learn communication strategies, decision-making frameworks, and conflict resolution techniques.",
    content: `# Leadership Fundamentals

## Course Overview
Develop the essential skills needed to become an effective leader in any organization.

## Learning Objectives
- Understand different leadership styles
- Develop effective communication skills
- Learn team management strategies
- Master conflict resolution techniques
- Build decision-making frameworks

## Course Structure
### Module 1: Leadership Foundations
- Leadership vs. management
- Personal leadership style assessment
- Building trust and credibility
- Leading by example

### Module 2: Communication Excellence
- Active listening techniques
- Giving and receiving feedback
- Public speaking and presentations
- Written communication skills

### Module 3: Team Management
- Team formation and dynamics
- Motivation and engagement strategies
- Delegation and empowerment
- Performance management

### Module 4: Advanced Leadership Skills
- Strategic thinking and planning
- Change management
- Crisis leadership
- Developing future leaders

## Assessment Methods
- Leadership style assessment
- Case study analysis
- Team project leadership
- Peer feedback sessions
- Final leadership presentation

## Practical Applications
- Real-world leadership scenarios
- Role-playing exercises
- Group discussions and debates
- Leadership journal reflection`,
    duration: "4 weeks",
    difficulty: "intermediate",
    category: "leadership",
    instructor: "Maria Rodriguez",
    visibleToRoles: ["volunteer", "board_member", "admin"],
    isPublic: true,
    createdAt: "2024-01-05T11:30:00Z",
    updatedAt: "2024-01-18T13:20:00Z",
    enrolledUsers: ["user-2", "user-4"],
    completedUsers: ["user-2"],
    materials: [
      "Leadership Assessment Tools",
      "Communication Templates",
      "Case Study Collection",
      "Leadership Reading List",
    ],
    videoUrl: "https://example.com/course-video-3",
    certificateEnabled: true,
  },
  {
    id: "course-4",
    organizationId: "org-1",
    title: "Digital Design Principles",
    description:
      "Master the fundamentals of digital design including typography, color theory, layout principles, and user interface design for web and mobile applications.",
    content: `# Digital Design Principles

## Course Overview
Learn the fundamental principles of digital design and create stunning visual experiences.

## Learning Objectives
- Master typography and color theory
- Understand layout and composition principles
- Learn user interface design patterns
- Create responsive design systems
- Develop a professional design portfolio

## Course Structure
### Module 1: Design Fundamentals
- Elements and principles of design
- Color theory and psychology
- Typography and hierarchy
- Visual composition techniques

### Module 2: Digital Design Tools
- Adobe Creative Suite mastery
- Figma for UI/UX design
- Sketch and prototyping tools
- Design system creation

### Module 3: User Interface Design
- UI design patterns and conventions
- Mobile-first design approach
- Accessibility in design
- Interaction design principles

### Module 4: Portfolio Development
- Building a design portfolio
- Case study presentation
- Client communication skills
- Freelancing and career guidance

## Software Requirements
- Adobe Creative Cloud subscription
- Figma (free tier available)
- Modern computer with graphics capabilities
- High-resolution monitor recommended

## Projects
- Logo design project
- Website redesign challenge
- Mobile app interface design
- Complete brand identity system`,
    duration: "10 weeks",
    difficulty: "intermediate",
    category: "design",
    instructor: "Emma Thompson",
    visibleToRoles: ["volunteer", "participant"],
    isPublic: true,
    createdAt: "2024-01-12T14:15:00Z",
    updatedAt: "2024-01-22T10:30:00Z",
    enrolledUsers: ["user-1", "user-3"],
    completedUsers: [],
    materials: [
      "Design Principles Handbook",
      "Color Palette Generator",
      "Typography Guide",
      "UI Pattern Library",
      "Portfolio Templates",
    ],
    videoUrl: "https://example.com/course-video-4",
    certificateEnabled: true,
  },
  {
    id: "course-5",
    organizationId: "org-1",
    title: "Project Management Essentials",
    description:
      "Learn proven project management methodologies including Agile, Scrum, and traditional approaches. Master planning, execution, and delivery of successful projects.",
    content: `# Project Management Essentials

## Course Overview
Master the essential skills and methodologies needed for successful project management.

## Learning Objectives
- Understand project management fundamentals
- Learn Agile and Scrum methodologies
- Master project planning and scheduling
- Develop risk management strategies
- Build stakeholder communication skills

## Course Structure
### Module 1: Project Management Foundations
- Project lifecycle and phases
- Stakeholder identification and analysis
- Project charter and scope definition
- Success criteria and metrics

### Module 2: Planning and Scheduling
- Work breakdown structures
- Timeline and milestone planning
- Resource allocation and management
- Budget planning and cost control

### Module 3: Agile Methodologies
- Agile principles and values
- Scrum framework and ceremonies
- Kanban and lean principles
- Sprint planning and retrospectives

### Module 4: Execution and Delivery
- Team leadership and motivation
- Risk identification and mitigation
- Quality assurance and control
- Project closure and lessons learned

## Tools and Software
- Microsoft Project or equivalent
- Jira for Agile project management
- Trello or Asana for task management
- Slack for team communication
- Google Workspace for collaboration

## Certification Preparation
This course prepares you for:
- PMP (Project Management Professional)
- Certified ScrumMaster (CSM)
- Agile Certified Practitioner (PMI-ACP)`,
    duration: "12 weeks",
    difficulty: "intermediate",
    category: "project-management",
    instructor: "Michael Brown",
    visibleToRoles: ["board_member", "admin"],
    isPublic: false,
    createdAt: "2024-01-08T16:45:00Z",
    updatedAt: "2024-01-28T12:15:00Z",
    enrolledUsers: ["user-2", "user-4"],
    completedUsers: [],
    materials: [
      "Project Management Templates",
      "Agile Planning Tools",
      "Risk Assessment Matrices",
      "Stakeholder Communication Plans",
      "Certification Study Guides",
    ],
    videoUrl: "https://example.com/course-video-5",
    certificateEnabled: true,
  },
  {
    id: "course-6",
    organizationId: "org-1",
    title: "Effective Communication Skills",
    description:
      "Enhance your communication abilities across all mediums. Learn public speaking, written communication, active listening, and interpersonal skills for professional success.",
    content: `# Effective Communication Skills

## Course Overview
Develop comprehensive communication skills for personal and professional success.

## Learning Objectives
- Master verbal and non-verbal communication
- Develop active listening skills
- Learn public speaking techniques
- Improve written communication
- Build interpersonal relationship skills

## Course Structure
### Module 1: Communication Fundamentals
- Communication process and barriers
- Verbal vs. non-verbal communication
- Cultural sensitivity and awareness
- Emotional intelligence in communication

### Module 2: Interpersonal Communication
- Active listening techniques
- Empathy and understanding
- Conflict resolution skills
- Building rapport and trust

### Module 3: Public Speaking
- Overcoming speaking anxiety
- Speech structure and organization
- Delivery techniques and body language
- Using visual aids effectively

### Module 4: Written Communication
- Professional email etiquette
- Report and proposal writing
- Social media communication
- Documentation and record keeping

## Practice Opportunities
- Weekly speaking exercises
- Peer feedback sessions
- Video recording and analysis
- Group discussion facilitation
- Presentation competitions

## Assessment Methods
- Oral presentations
- Written assignments
- Peer evaluations
- Self-reflection journals
- Final communication portfolio`,
    duration: "6 weeks",
    difficulty: "beginner",
    category: "communication",
    instructor: "Lisa Wang",
    visibleToRoles: ["volunteer", "participant", "board_member"],
    isPublic: true,
    createdAt: "2024-01-20T09:30:00Z",
    updatedAt: "2024-01-30T15:45:00Z",
    enrolledUsers: ["user-3"],
    completedUsers: [],
    materials: [
      "Communication Skills Workbook",
      "Public Speaking Checklist",
      "Email Templates Collection",
      "Presentation Design Guide",
      "Active Listening Exercises",
    ],
    videoUrl: "https://example.com/course-video-6",
    certificateEnabled: false,
  },
]

// Mock user progress data
export interface CourseProgress {
  userId: string
  courseId: string
  enrolledAt: string
  lastAccessedAt: string
  completionPercentage: number
  completedModules: string[]
  totalModules: number
  timeSpent: number // in minutes
  certificateEarned: boolean
  certificateEarnedAt?: string
  notes: string
  bookmarkedSections: string[]
}

export const mockCourseProgress: CourseProgress[] = [
  {
    userId: "user-1",
    courseId: "course-1",
    enrolledAt: "2024-01-16T10:00:00Z",
    lastAccessedAt: "2024-01-30T14:30:00Z",
    completionPercentage: 100,
    completedModules: ["module-1", "module-2", "module-3", "module-4"],
    totalModules: 4,
    timeSpent: 480, // 8 hours
    certificateEarned: true,
    certificateEarnedAt: "2024-01-30T14:30:00Z",
    notes: "Excellent course! Really helped me understand web development fundamentals.",
    bookmarkedSections: ["javascript-basics", "responsive-design"],
  },
  {
    userId: "user-1",
    courseId: "course-2",
    enrolledAt: "2024-01-20T11:00:00Z",
    lastAccessedAt: "2024-01-31T16:45:00Z",
    completionPercentage: 65,
    completedModules: ["module-1", "module-2"],
    totalModules: 4,
    timeSpent: 320, // 5.3 hours
    certificateEarned: false,
    notes: "Advanced concepts are challenging but very valuable.",
    bookmarkedSections: ["custom-hooks", "performance-optimization"],
  },
  {
    userId: "user-2",
    courseId: "course-3",
    enrolledAt: "2024-01-10T09:00:00Z",
    lastAccessedAt: "2024-01-25T12:20:00Z",
    completionPercentage: 100,
    completedModules: ["module-1", "module-2", "module-3", "module-4"],
    totalModules: 4,
    timeSpent: 240, // 4 hours
    certificateEarned: true,
    certificateEarnedAt: "2024-01-25T12:20:00Z",
    notes: "Great insights into leadership. Will apply these concepts immediately.",
    bookmarkedSections: ["team-management", "conflict-resolution"],
  },
  {
    userId: "user-3",
    courseId: "course-1",
    enrolledAt: "2024-01-18T14:00:00Z",
    lastAccessedAt: "2024-01-29T10:15:00Z",
    completionPercentage: 45,
    completedModules: ["module-1"],
    totalModules: 4,
    timeSpent: 180, // 3 hours
    certificateEarned: false,
    notes: "Taking my time to really understand each concept.",
    bookmarkedSections: ["html-semantics", "css-flexbox"],
  },
  {
    userId: "user-3",
    courseId: "course-6",
    enrolledAt: "2024-01-22T16:30:00Z",
    lastAccessedAt: "2024-01-31T11:45:00Z",
    completionPercentage: 30,
    completedModules: [],
    totalModules: 4,
    timeSpent: 90, // 1.5 hours
    certificateEarned: false,
    notes: "Just started, looking forward to improving my communication skills.",
    bookmarkedSections: ["active-listening"],
  },
]
