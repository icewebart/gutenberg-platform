"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailPreview } from "./email-templates/email-preview"
import { Mail, Send, Clock, CheckCircle, XCircle, Users } from "lucide-react"

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: "draft" | "scheduled" | "sent" | "failed"
  recipients: number
  sentAt?: string
  scheduledFor?: string
}

export function EmailService() {
  const [campaigns] = useState<EmailCampaign[]>([
    {
      id: "1",
      name: "Welcome New Volunteers",
      subject: "Welcome to Gutenberg Foundation!",
      status: "sent",
      recipients: 45,
      sentAt: "2024-03-15 10:30 AM",
    },
    {
      id: "2",
      name: "Project Update Notification",
      subject: "Community Garden Project - Week 3 Update",
      status: "scheduled",
      recipients: 23,
      scheduledFor: "2024-03-20 09:00 AM",
    },
    {
      id: "3",
      name: "Monthly Newsletter",
      subject: "March Newsletter - Community Highlights",
      status: "draft",
      recipients: 156,
    },
  ])

  const [newEmail, setNewEmail] = useState({
    subject: "",
    recipients: "all_volunteers",
    content: "",
    scheduleDate: "",
    scheduleTime: "",
  })

  const getStatusIcon = (status: EmailCampaign["status"]) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Mail className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: EmailCampaign["status"]) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSendEmail = () => {
    console.log("Sending email:", newEmail)
    // Here you would integrate with your email service
  }

  const handleScheduleEmail = () => {
    console.log("Scheduling email:", newEmail)
    // Here you would schedule the email
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Email Service</h2>
          <p className="text-gray-600">Manage email campaigns and communications</p>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(campaign.status)}
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{campaign.recipients} recipients</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      {campaign.sentAt && <span className="text-xs text-gray-500">Sent: {campaign.sentAt}</span>}
                      {campaign.scheduledFor && (
                        <span className="text-xs text-gray-500">Scheduled: {campaign.scheduledFor}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                    placeholder="Enter email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select
                    value={newEmail.recipients}
                    onValueChange={(value) => setNewEmail({ ...newEmail, recipients: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_volunteers">All Volunteers</SelectItem>
                      <SelectItem value="all_participants">All Participants</SelectItem>
                      <SelectItem value="board_members">Board Members</SelectItem>
                      <SelectItem value="active_projects">Active Project Members</SelectItem>
                      <SelectItem value="custom">Custom List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={newEmail.content}
                  onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
                  placeholder="Enter your email content here..."
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduleDate">Schedule Date (Optional)</Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={newEmail.scheduleDate}
                    onChange={(e) => setNewEmail({ ...newEmail, scheduleDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleTime">Schedule Time (Optional)</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={newEmail.scheduleTime}
                    onChange={(e) => setNewEmail({ ...newEmail, scheduleTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSendEmail} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Now
                </Button>
                <Button
                  variant="outline"
                  onClick={handleScheduleEmail}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Clock className="h-4 w-4" />
                  Schedule Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <EmailPreview />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Rate</p>
                    <p className="text-2xl font-bold">68.5%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Click Rate</p>
                    <p className="text-2xl font-bold">24.3%</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
