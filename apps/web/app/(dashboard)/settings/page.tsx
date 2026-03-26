"use client"

export const runtime = "edge"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Bell, Shield, Save, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [savingNotifs, setSavingNotifs] = useState(false)
  const [notifsLoading, setNotifsLoading] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  })

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  })

  const [notifPrefs, setNotifPrefs] = useState({
    memberJoined: true,
    projectUpdates: true,
    taskAssigned: true,
    communityReplies: true,
    applicationUpdates: true,
    systemAlerts: false,
  })

  // Load notification preferences
  useEffect(() => {
    fetch("/api/bff/notifications/preferences")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setNotifPrefs({
            memberJoined: data.memberJoined ?? true,
            projectUpdates: data.projectUpdates ?? true,
            taskAssigned: data.taskAssigned ?? true,
            communityReplies: data.communityReplies ?? true,
            applicationUpdates: data.applicationUpdates ?? true,
            systemAlerts: data.systemAlerts ?? false,
          })
        }
      })
      .catch(() => {})
      .finally(() => setNotifsLoading(false))
  }, [])

  const initials = user?.name?.split(" ").map((n) => n[0]).join("") ?? "?"

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/bff/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileForm.name }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="title-page">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="title-section">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-gray-200">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize text-xs">
                      {user.role.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-gray-400">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    className="rounded-field"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    className="rounded-field"
                    value={profileForm.email}
                    disabled
                    title="Email cannot be changed here"
                  />
                  <p className="text-xs text-gray-400">Contact an admin to change your email.</p>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : saved ? (
                  "✓ Saved"
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="title-section">Notification Preferences</CardTitle>
              <CardDescription>Choose which events create notifications for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {([
                    { key: "memberJoined", label: "New member joins", desc: "When someone joins your organisation" },
                    { key: "projectUpdates", label: "Project updates", desc: "Changes to projects you're part of" },
                    { key: "taskAssigned", label: "Task assigned", desc: "When a task is assigned to you" },
                    { key: "communityReplies", label: "Community replies", desc: "Replies to your posts" },
                    { key: "applicationUpdates", label: "Application updates", desc: "Updates on project applications" },
                    { key: "systemAlerts", label: "System alerts", desc: "Platform announcements and updates" },
                  ] as { key: keyof typeof notifPrefs; label: string; desc: string }[]).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifPrefs[key] ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifPrefs[key] ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                  <Button
                    className="btn-primary mt-2"
                    disabled={savingNotifs}
                    onClick={async () => {
                      setSavingNotifs(true)
                      try {
                        const res = await fetch("/api/bff/notifications/preferences", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(notifPrefs),
                        })
                        if (res.ok) {
                          toast({ title: "Preferences saved", description: "Your notification settings have been updated." })
                        } else {
                          toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" })
                        }
                      } finally {
                        setSavingNotifs(false)
                      }
                    }}
                  >
                    {savingNotifs ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Preferences
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="title-section">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    className="rounded-field pr-10"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="rounded-field pr-10"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="rounded-field"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              {passwordForm.next && passwordForm.confirm && passwordForm.next !== passwordForm.confirm && (
                <p className="text-xs text-red-500">Passwords do not match.</p>
              )}
              <Button
                className="btn-primary"
                disabled={savingPassword || !passwordForm.current || !passwordForm.next || passwordForm.next !== passwordForm.confirm}
                onClick={async () => {
                  setSavingPassword(true)
                  try {
                    const res = await fetch(`/api/bff/users/${user?.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ currentPassword: passwordForm.current, password: passwordForm.next }),
                    })
                    if (res.ok) {
                      toast({ title: "Password updated", description: "Your password has been changed." })
                      setPasswordForm({ current: "", next: "", confirm: "" })
                    } else {
                      const data = await res.json()
                      toast({ title: "Error", description: data.error || "Failed to update password", variant: "destructive" })
                    }
                  } finally {
                    setSavingPassword(false)
                  }
                }}
              >
                {savingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
