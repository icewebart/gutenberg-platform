"use client"

export const runtime = "edge"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { RegistrationForm } from "@/components/registration-form"

export default function Home() {
  const [showRegistration, setShowRegistration] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 px-4">
      {showRegistration ? (
        <RegistrationForm onSwitchToLogin={() => setShowRegistration(false)} />
      ) : (
        <LoginForm onSwitchToRegister={() => setShowRegistration(true)} />
      )}
    </div>
  )
}
