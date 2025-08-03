"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, Users, TrendingUp, Settings } from "lucide-react"
import { EmailPreview } from "./email-templates/email-preview"

export function EmailService() {
  const [activeTab, setActiveTab] = useState("compose")
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    template: "",
    message: "",
  })

  const emailTemplates = [
    { id: "welcome", name: "Welcome Email", description: "Welcome new users" },
    { id: "password-reset", name: "Password Reset", description: "Password reset instructions" },
    { id: "verification", name: "Email Verification", description: "Verify email address" },
    { id: "notification", name: "Notification", description: "General notifications" },
    { id: "digest", name: "Weekly Digest", description: "Weekly activity summary" },
  ]

  const recentEmails = [
    { id: 1, to: "john@example.com", subject: "Welcome to Gutenberg CRM", status: "sent", date: "2024-01-15" },
    { id: 2, to: "sarah@example.com", subject: "Password Reset Request", status: "delivered", date: "2024-01-14" },
    { id: 3, to: "mike@example.com", subject: "Weekly Digest", status: "opened", date: "2024-01-13" },
    { id: 4, to: "emma@example.com", subject: "Project Assignment", status: "clicked", date: "2024-01-12" },
  ]

  const handleSendEmail = () => {
    console.log("Sending email:", emailData)
    // Here you would integrate with your email service
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Service</h2>
          <p className="text-muted-foreground">Manage and send emails to volunteers and participants</p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Email Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>Send emails to volunteers and participants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    placeholder="recipient@example.com"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={emailData.template}
                    onValueChange={(value) => setEmailData({ ...emailData, template: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Email content..."
                  rows={6}
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendEmail}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button variant="outline">Save Draft</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage your email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {emailTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm">Edit</Button>
                        <Button size="sm" variant="outline">
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>Recent email activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{email.subject}</p>
                      <p className="text-sm text-muted-foreground">To: {email.to}</p>
                      <p className="text-xs text-muted-foreground">{email.date}</p>
                    </div>
                    <Badge
                      variant={
                        email.status === "sent"
                          ? "secondary"
                          : email.status === "delivered"
                            ? "default"
                            : email.status === "opened"
                              ? "default"
                              : "default"
                      }
                    >
                      {email.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <EmailPreview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
