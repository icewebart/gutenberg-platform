"use client"

export const runtime = "edge"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure your account and platform preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Settings — Coming Soon</p>
      </CardContent>
    </Card>
  )
}
