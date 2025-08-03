"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, MessageSquare, BookOpen, BarChart3, LogOut, Bell, Search } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { VolunteersManagement } from "@/components/volunteers/volunteers-management"
import { ProjectsManagement } from "@/components/projects/projects-management"
import { LearningCenter } from "@/components/learning/learning-center"
import { CommunityForum } from "@/components/community/community-forum"
import { ChatLayout } from "@/components/chat/chat-layout"
import { DashboardOverview } from "@/components/dashboard-overview"

export function GutenbergCRM() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Gutenberg CRM</h1>
            <Badge variant="secondary">Volunteer Management</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent">
                <TabsTrigger
                  value="dashboard"
                  className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="volunteers"
                  className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Volunteers
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="learning"
                  className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learning
                </TabsTrigger>
                <TabsTrigger
                  value="community"
                  className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Community
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="w-full justify-start data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard">
              <DashboardOverview />
            </TabsContent>
            <TabsContent value="volunteers">
              <VolunteersManagement />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectsManagement />
            </TabsContent>
            <TabsContent value="learning">
              <LearningCenter />
            </TabsContent>
            <TabsContent value="community">
              <CommunityForum />
            </TabsContent>
            <TabsContent value="chat">
              <ChatLayout />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
