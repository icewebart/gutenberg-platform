import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { getVolunteers } from "@/lib/supabase/projects"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateProjectForm } from "@/components/projects/create-project-form"

export default async function CreateProjectPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth")
  }

  // Fetch volunteers for project manager and member selection
  const volunteers = await getVolunteers(profile.organization_id)

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
          currentUserId={user.id}
        />
      </div>
    </DashboardLayout>
  )
}
