"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegistrationForm } from "./registration-form"
import { AuthProvider } from "./auth-context"
import { MultiTenantProvider } from "./multi-tenant-context"

export default function Creative() {
  const [showRegistration, setShowRegistration] = useState(false)

  return (
    <AuthProvider>
      <MultiTenantProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 px-4">
          {showRegistration ? (
            <RegistrationForm onSwitchToLogin={() => setShowRegistration(false)} />
          ) : (
            <LoginForm onSwitchToRegister={() => setShowRegistration(true)} />
          )}
        </div>
      </MultiTenantProvider>
    </AuthProvider>
  )
}
