import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateProjectForm } from "@/components/projects/create-project-form"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default async function CreateProjectPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("gutenberg_session")?.value

  if (!token) {
    redirect("/")
  }

  const headers = { Authorization: `Bearer ${token}` }

  const [meRes, usersRes] = await Promise.all([
    fetch(`${API_URL}/auth/me`, { headers }),
    fetch(`${API_URL}/users`, { headers }),
  ])

  if (!meRes.ok) {
    redirect("/")
  }

  const profile = await meRes.json()
  const volunteers = usersRes.ok ? await usersRes.json() : []

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600">Fill in the details to create a new project for your organization</p>
        </div>

        <CreateProjectForm
          organizationId={profile.organization_id}
          netzwerkCityId={profile.netzwerk_city_id}
          volunteers={volunteers}
          currentUserId={profile.id}
        />
      </div>
    </DashboardLayout>
  )
}
