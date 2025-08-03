"use client"

import { useState } from "react"
import { GutenbergCRM } from "./gutenberg-crm"
import { LoginForm } from "./login-form"
import { RegistrationForm } from "./registration-form"
import { ProtectedRoute } from "./protected-route"
import { AuthProvider } from "./auth-context"
import { MultiTenantProvider } from "./multi-tenant-context"

export default function Creative() {
  const [showRegistration, setShowRegistration] = useState(false)

  return (
    <AuthProvider>
      <MultiTenantProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <ProtectedRoute
            fallback={
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  {showRegistration ? (
                    <RegistrationForm onSwitchToLogin={() => setShowRegistration(false)} />
                  ) : (
                    <LoginForm onSwitchToRegister={() => setShowRegistration(true)} />
                  )}
                </div>
              </div>
            }
          >
            <GutenbergCRM />
          </ProtectedRoute>
        </div>
      </MultiTenantProvider>
    </AuthProvider>
  )
}
