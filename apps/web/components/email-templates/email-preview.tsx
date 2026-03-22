"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VerificationEmail } from "./verification-email"
import { WelcomeEmail } from "./welcome-email"
import { PasswordResetEmail } from "./password-reset-email"
import { NotificationEmail } from "./notification-email"
import { DigestEmail } from "./digest-email"

export function EmailPreview() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("verification")

  const sampleData = {
    userName: "John Doe",
    organizationName: "Gutenberg Foundation",
    verificationUrl: "https://example.com/verify?token=abc123",
    dashboardUrl: "https://example.com/dashboard",
    resetUrl: "https://example.com/reset?token=xyz789",
    logoUrl: "/placeholder.svg?height=60&width=200&text=Logo",
    notificationTitle: "New Project Assignment",
    notificationMessage:
      "You have been assigned to the 'Community Garden' project. Please review the project details and confirm your participation.",
    actionUrl: "https://example.com/projects/123",
    actionText: "View Project",
    digestItems: [
      {
        title: "New Community Garden Project Launched",
        description:
          "A new sustainability project has been launched in downtown area. Join us in creating a green space for the community.",
        url: "https://example.com/projects/garden",
        date: "March 15, 2024",
      },
      {
        title: "Volunteer Training Session",
        description:
          "Monthly training session for new volunteers covering safety protocols and project management basics.",
        url: "https://example.com/training",
        date: "March 12, 2024",
      },
      {
        title: "Community Meeting Results",
        description:
          "Summary of decisions made during the monthly community meeting, including budget allocations and upcoming events.",
        date: "March 10, 2024",
      },
    ],
  }

  const templates = [
    { id: "verification", name: "Email Verification" },
    { id: "welcome", name: "Welcome Email" },
    { id: "password-reset", name: "Password Reset" },
    { id: "notification", name: "Notification" },
    { id: "digest", name: "Weekly Digest" },
  ]

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "verification":
        return (
          <VerificationEmail
            userName={sampleData.userName}
            verificationUrl={sampleData.verificationUrl}
            organizationName={sampleData.organizationName}
            logoUrl={sampleData.logoUrl}
          />
        )
      case "welcome":
        return (
          <WelcomeEmail
            userName={sampleData.userName}
            organizationName={sampleData.organizationName}
            dashboardUrl={sampleData.dashboardUrl}
            logoUrl={sampleData.logoUrl}
          />
        )
      case "password-reset":
        return (
          <PasswordResetEmail
            userName={sampleData.userName}
            resetUrl={sampleData.resetUrl}
            organizationName={sampleData.organizationName}
            logoUrl={sampleData.logoUrl}
          />
        )
      case "notification":
        return (
          <NotificationEmail
            userName={sampleData.userName}
            notificationTitle={sampleData.notificationTitle}
            notificationMessage={sampleData.notificationMessage}
            actionUrl={sampleData.actionUrl}
            actionText={sampleData.actionText}
            organizationName={sampleData.organizationName}
            logoUrl={sampleData.logoUrl}
          />
        )
      case "digest":
        return (
          <DigestEmail
            userName={sampleData.userName}
            organizationName={sampleData.organizationName}
            digestItems={sampleData.digestItems}
            logoUrl={sampleData.logoUrl}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Template Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? "default" : "outline"}
                onClick={() => setSelectedTemplate(template.id)}
                size="sm"
              >
                {template.name}
              </Button>
            ))}
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">{renderTemplate()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
