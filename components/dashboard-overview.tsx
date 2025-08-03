"use client"
import { motion } from "framer-motion"
import { Calendar, Users, Award, TrendingUp, MapPin, Star, ArrowRight, Plus, Bell, Activity } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { useAuth } from "./auth-context"
import { useMultiTenant } from "./multi-tenant-context"
import { RoleBadge } from "./role-badge"
import { mockProjects } from "@/data/projects-data"

export function DashboardOverview() {
  const { user, hasRole } = useAuth()
  const { currentOrganization, netzwerkCities } = useMultiTenant()

  if (!user || !currentOrganization) return null

  // Get user's Netzwerk city
  const userNetzwerkCity = user.netzwerkCityId ? netzwerkCities.find((city) => city.id === user.netzwerkCityId) : null

  // Filter projects based on user role
  const userProjects = mockProjects.filter((project) => {
    if (user.role === "participant") {
      return project.participants.includes(user.id)
    } else if (user.role === "volunteer") {
      return project.participants.includes(user.id) || project.volunteers.includes(user.id)
    } else {
      return project.organizationId === currentOrganization.id
    }
  })

  const upcomingProjects = userProjects.filter((p) => p.status === "upcoming").slice(0, 3)
  const recentActivities = [
    {
      id: 1,
      type: "project_joined",
      title: "Joined Web Development Workshop",
      description: "You've been enrolled in the upcoming workshop series",
      timestamp: "2 hours ago",
      icon: Users,
      color: "text-blue-600",
    },
    {
      id: 2,
      type: "points_earned",
      title: "Earned 50 points",
      description: "Completed community forum participation",
      timestamp: "1 day ago",
      icon: Award,
      color: "text-yellow-600",
    },
    {
      id: 3,
      type: "project_completed",
      title: "Completed AI Workshop",
      description: "Successfully finished the 3-day bootcamp",
      timestamp: "3 days ago",
      icon: Star,
      color: "text-green-600",
    },
  ]

  const getRoleSpecificStats = () => {
    switch (user.role) {
      case "volunteer":
        return [
          {
            title: "Active Projects",
            value: userProjects.filter((p) => p.status === "ongoing").length,
            description: "Currently participating",
            icon: Activity,
            color: "text-blue-600",
          },
          {
            title: "Points Balance",
            value: user.points,
            description: "Available for redemption",
            icon: Award,
            color: "text-yellow-600",
          },
          {
            title: "Completed Projects",
            value: userProjects.filter((p) => p.status === "completed").length,
            description: "Successfully finished",
            icon: Star,
            color: "text-green-600",
          },
          {
            title: "Upcoming Events",
            value: upcomingProjects.length,
            description: "Starting soon",
            icon: Calendar,
            color: "text-purple-600",
          },
        ]

      case "participant":
        return [
          {
            title: "My Projects",
            value: userProjects.length,
            description: "Total assigned",
            icon: Users,
            color: "text-blue-600",
          },
          {
            title: "Completed",
            value: userProjects.filter((p) => p.status === "completed").length,
            description: "Successfully finished",
            icon: Star,
            color: "text-green-600",
          },
          {
            title: "In Progress",
            value: userProjects.filter((p) => p.status === "ongoing").length,
            description: "Currently active",
            icon: Activity,
            color: "text-orange-600",
          },
          {
            title: "Upcoming",
            value: upcomingProjects.length,
            description: "Starting soon",
            icon: Calendar,
            color: "text-purple-600",
          },
        ]

      case "board_member":
        const orgProjects = mockProjects.filter((p) => p.organizationId === currentOrganization.id)
        return [
          {
            title: "Total Projects",
            value: orgProjects.length,
            description: "Organization-wide",
            icon: Activity,
            color: "text-blue-600",
          },
          {
            title: "Active Volunteers",
            value: 45, // Mock data
            description: "Currently engaged",
            icon: Users,
            color: "text-green-600",
          },
          {
            title: "Netzwerk Cities",
            value: netzwerkCities.length,
            description: "Under management",
            icon: MapPin,
            color: "text-purple-600",
          },
          {
            title: "This Month",
            value: orgProjects.filter((p) => {
              const startDate = new Date(p.startDate)
              const now = new Date()
              return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()
            }).length,
            description: "Projects started",
            icon: TrendingUp,
            color: "text-orange-600",
          },
        ]

      case "admin":
        return [
          {
            title: "Organizations",
            value: 3, // Mock data
            description: "Under management",
            icon: Users,
            color: "text-blue-600",
          },
          {
            title: "Total Users",
            value: 156, // Mock data
            description: "Across all orgs",
            icon: Users,
            color: "text-green-600",
          },
          {
            title: "Active Projects",
            value: mockProjects.filter((p) => p.status === "ongoing").length,
            description: "Currently running",
            icon: Activity,
            color: "text-purple-600",
          },
          {
            title: "System Health",
            value: "99.9%",
            description: "Uptime this month",
            icon: TrendingUp,
            color: "text-green-600",
          },
        ]

      default:
        return []
    }
  }

  const stats = getRoleSpecificStats()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <div className="flex items-center gap-3 mb-4">
                <RoleBadge role={user.role} variant="secondary" />
                {userNetzwerkCity && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {userNetzwerkCity.name}
                  </Badge>
                )}
              </div>
              <p className="text-blue-100 max-w-md">
                {user.role === "volunteer" &&
                  "Ready to make a difference? Check out the latest projects and opportunities."}
                {user.role === "participant" &&
                  "Your learning journey continues. See your upcoming projects and activities."}
                {user.role === "board_member" &&
                  "Manage your volunteers and projects effectively. Your leadership makes the difference."}
                {user.role === "admin" &&
                  "Oversee the entire organization. Monitor performance and ensure smooth operations."}
              </p>
            </div>
            <div className="hidden md:block">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl bg-white/20">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {user.role === "participant" ? "My Upcoming Projects" : "Upcoming Projects"}
              </CardTitle>
              <Button variant="ghost" size="sm" className="rounded-xl">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming projects</p>
                  {hasRole(["volunteer", "board_member", "admin"]) && (
                    <Button variant="outline" className="mt-4 rounded-xl bg-transparent">
                      <Plus className="mr-2 h-4 w-4" />
                      Explore Projects
                    </Button>
                  )}
                </div>
              ) : (
                upcomingProjects.map((project) => {
                  const daysUntilStart = Math.ceil(
                    (new Date(project.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                  )

                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {project.title.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{project.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {project.type}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {daysUntilStart > 0 ? `${daysUntilStart} days` : "Starting soon"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {project.currentParticipants}/{project.maxParticipants || "∞"} enrolled
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Bell className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={cn("flex-shrink-0 p-2 rounded-lg bg-gray-100")}>
                  <activity.icon className={cn("h-4 w-4", activity.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full rounded-xl mt-4 bg-transparent">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {hasRole(["volunteer", "board_member", "admin"]) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {user.role === "volunteer" && (
                <>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Projects
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Award className="mr-2 h-4 w-4" />
                    View Store
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Schedule
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Star className="mr-2 h-4 w-4" />
                    Learning Center
                  </Button>
                </>
              )}

              {user.role === "board_member" && (
                <>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Volunteers
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <MapPin className="mr-2 h-4 w-4" />
                    Netzwerk Cities
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Activity className="mr-2 h-4 w-4" />
                    Add Activity
                  </Button>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Users className="mr-2 h-4 w-4" />
                    User Management
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <Activity className="mr-2 h-4 w-4" />
                    System Analytics
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <MapPin className="mr-2 h-4 w-4" />
                    Organizations
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Reports
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
