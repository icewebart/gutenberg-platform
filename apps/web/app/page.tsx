"use client"

import { Suspense, useState } from "react"
import { useAuth } from "@/components/auth-context"
import { LoginForm } from "@/components/login-form"
import { RegistrationForm } from "@/components/registration-form"
import { GutenbergCRM } from "@/components/gutenberg-crm"

export default function Home() {
  const { user, isLoading } = useAuth()
  const [showRegistration, setShowRegistration] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return showRegistration ? (
      <RegistrationForm onSwitchToLogin={() => setShowRegistration(false)} />
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 px-4">
        <LoginForm onSwitchToRegister={() => setShowRegistration(true)} />
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <GutenbergCRM />
    </Suspense>
  )
}
