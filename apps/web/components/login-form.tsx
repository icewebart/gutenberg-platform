"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "./auth-context"

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)
    if (!success) {
      setError("Invalid email or password")
    }
  }

  const demoAccounts = [
    { email: "admin@gutenberg.org", role: "Admin", password: "change-me-strong-password" },
    { email: "board@gutenberg.org", role: "Board Member", password: "board123" },
    { email: "volunteer@gutenberg.org", role: "Volunteer", password: "volunteer123" },
    { email: "participant@gutenberg.org", role: "Participant", password: "participant123" },
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">Sign in to your Gutenberg account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={onSwitchToRegister} className="text-sm text-blue-600 hover:underline">
              Don't have an account? Sign up
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3 text-center">Demo Accounts:</p>
          <div className="space-y-2">
            {demoAccounts.map((account, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left bg-transparent"
                onClick={() => { setEmail(account.email); setPassword(account.password) }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{account.role}</span>
                  <span className="text-xs text-gray-500">{account.email}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
