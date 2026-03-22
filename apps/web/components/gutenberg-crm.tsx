"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "./dashboard-layout"
import { DashboardOverview } from "./dashboard-overview"
import { ProjectsManagement } from "./projects/projects-management"
import { CommunityForum } from "./community/community-forum"
import { LearningCenter } from "./learning/learning-center"
import { VolunteersManagement } from "./volunteers/volunteers-management"
import { StoreInterface } from "./store/store-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatLayout } from "./chat/chat-layout"

const VALID_TABS = [
  "dashboard",
  "projects",
  "volunteers",
  "community",
  "learning",
  "store",
  "chat",
  "settings",
  "my-projects",
  "netzwerk",
  "organizations",
  "users",
] as const

export function GutenbergCRM() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab")

  const [activeTab, setActiveTabState] = useState("dashboard")

  useEffect(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])) {
      setActiveTabState(tabFromUrl)
    }
  }, [tabFromUrl])

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onTabChange={setActiveTab} />
      case "projects":
      case "my-projects":
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
        return <DashboardOverview onTabChange={setActiveTab} />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  )
}
