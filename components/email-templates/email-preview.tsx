"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordResetEmail } from "./password-reset-email"
import { VerificationEmail } from "./verification-email"
import { WelcomeEmail } from "./welcome-email"
import { NotificationEmail } from "./notification-email"
import { DigestEmail } from "./digest-email"

export function EmailPreview() {
  const [previewData, setPreviewData] = useState({
    userName: "John Doe",
    userEmail: "john@example.com",
    resetLink: "https://example.com/reset-password?token=abc123",
    verificationLink: "https://example.com/verify?token=xyz789",
    loginUrl: "https://example.com/auth",
    organizationName: "Gutenberg Foundation",
  })

  const digestItems = [
    {
      title: "New Volunteer Opportunity",
      description: "Help organize the community book fair this weekend.",
      date: "2 days ago",
      url: "https://example.com/projects/book-fair",
    },
    {
      title: "Training Session Completed",
      description: "You completed the 'Effective Communication' training module.",
      date: "3 days ago",
      url: "https://example.com/learning/communication",
    },
    {
      title: "Community Discussion",
      description: "New discussion started about upcoming fundraising events.",
      date: "5 days ago",
      url: "https://example.com/community/fundraising",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Email Template Preview</h1>
        <p className="text-gray-600 mt-2">Preview and test email templates for the Gutenberg CRM system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Preview Settings</CardTitle>
              <CardDescription>Customize the preview data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={previewData.userName}
                  onChange={(e) => setPreviewData({ ...previewData, userName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="userEmail">User Email</Label>
                <Input
                  id="userEmail"
                  value={previewData.userEmail}
                  onChange={(e) => setPreviewData({ ...previewData, userEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="organizationName">Organization</Label>
                <Input
                  id="organizationName"
                  value={previewData.organizationName}
                  onChange={(e) => setPreviewData({ ...previewData, organizationName: e.target.value })}
                />
              </div>
              <Button className="w-full">Send Test Email</Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Preview different email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password-reset" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="password-reset">Reset</TabsTrigger>
                  <TabsTrigger value="verification">Verify</TabsTrigger>
                  <TabsTrigger value="welcome">Welcome</TabsTrigger>
                  <TabsTrigger value="notification">Notify</TabsTrigger>
                  <TabsTrigger value="digest">Digest</TabsTrigger>
                </TabsList>

                <TabsContent value="password-reset" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <PasswordResetEmail
                      resetLink={previewData.resetLink}
                      userEmail={previewData.userEmail}
                      userName={previewData.userName}
                      organizationName={previewData.organizationName}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <VerificationEmail
                      verificationLink={previewData.verificationLink}
                      userEmail={previewData.userEmail}
                      userName={previewData.userName}
                      organizationName={previewData.organizationName}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="welcome" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <WelcomeEmail
                      userName={previewData.userName}
                      userEmail={previewData.userEmail}
                      loginUrl={previewData.loginUrl}
                      organizationName={previewData.organizationName}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="notification" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <NotificationEmail
                      userName={previewData.userName}
                      title="New Project Assignment"
                      message="You have been assigned to a new volunteer project. Please review the details and confirm your participation."
                      actionUrl="https://example.com/projects/123"
                      actionText="View Project"
                      organizationName={previewData.organizationName}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="digest" className="mt-4">
                  <div className="border rounded-lg overflow-hidden">
                    <DigestEmail
                      userName={previewData.userName}
                      items={digestItems}
                      period="Week"
                      organizationName={previewData.organizationName}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
