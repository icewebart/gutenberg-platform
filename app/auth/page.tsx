"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/login-form"
import { RegistrationForm } from "@/components/registration-form"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

type AuthMode = "login" | "register" | "forgot-password"

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gutenberg CRM</h1>
          <p className="text-gray-600 mt-2">Volunteer Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "login" && "Sign In"}
              {mode === "register" && "Create Account"}
              {mode === "forgot-password" && "Reset Password"}
            </CardTitle>
            <CardDescription>
              {mode === "login" && "Welcome back! Please sign in to your account."}
              {mode === "register" && "Create a new account to get started."}
              {mode === "forgot-password" && "Enter your email to receive a password reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" && (
              <LoginForm
                onSwitchToRegister={() => setMode("register")}
                onSwitchToForgotPassword={() => setMode("forgot-password")}
              />
            )}
            {mode === "register" && <RegistrationForm onSwitchToLogin={() => setMode("login")} />}
            {mode === "forgot-password" && <ForgotPasswordForm onBack={() => setMode("login")} />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
