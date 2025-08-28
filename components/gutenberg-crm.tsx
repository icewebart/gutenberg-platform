"use client"

import { useState } from "react"
import { DashboardLayout } from "./dashboard-layout"
import { DashboardOverview } from "./dashboard-overview"
import { ProjectsManagement } from "./projects/projects-management"
import { CommunityForum } from "./community/community-forum"
import { LearningCenter } from "./learning/learning-center"
import { VolunteersManagement } from "./volunteers/volunteers-management"
import { StoreInterface } from "./store/store-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatLayout } from "./chat/chat-layout"

export function GutenbergCRM() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "projects":
        return <ProjectsManagement />
      case "volunteers":
        return <VolunteersManagement />
      case "community":
        return <CommunityForum />
      case "learning":
        return <LearningCenter />
      case "store":
        return <StoreInterface />
      case "chat":
        return <ChatLayout />
      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Settings (Coming Soon)</p>
            </CardContent>
          </Card>
        )
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  )
}
