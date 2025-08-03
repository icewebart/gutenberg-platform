"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/login-form"
import { RegistrationForm } from "@/components/registration-form"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { createDemoUser } from "./actions"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")

  const handleDemoLogin = async (role: "admin" | "manager" | "volunteer") => {
    try {
      await createDemoUser(role)
    } catch (error) {
      console.error("Demo login error:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="text-gray-600 mt-2">Sign in to your account or create a new one</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Choose your preferred method to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="forgot">Reset</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <LoginForm />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or try demo accounts</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin("admin")} className="text-xs">
                    Admin Demo
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin("manager")} className="text-xs">
                    Manager Demo
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin("volunteer")} className="text-xs">
                    Volunteer Demo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register">
                <RegistrationForm />
              </TabsContent>

              <TabsContent value="forgot">
                <ForgotPasswordForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
