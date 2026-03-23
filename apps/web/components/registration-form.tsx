"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, User, Mail, Lock } from "lucide-react"
import { useAuth } from "./auth-context"

interface RegistrationFormProps {
  onSwitchToLogin: () => void
}

export function RegistrationForm({ onSwitchToLogin }: RegistrationFormProps) {
  const { register } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer" as "volunteer" | "participant",
    agreeToTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setLoading(true)
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Registration failed. Email may already be in use.")
      }
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <Building2 className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">Join the Gutenberg platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as "volunteer" | "participant" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the terms and conditions
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={onSwitchToLogin} className="text-sm text-blue-600 hover:underline">
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
