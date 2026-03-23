"use client"

export const runtime = "edge"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrganizationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>Manage all organizations on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Organizations — Coming Soon</p>
      </CardContent>
    </Card>
  )
}
