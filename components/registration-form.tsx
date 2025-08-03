"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"
import { signUp } from "@/app/auth/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating Account..." : "Create Account"}
    </Button>
  )
}

interface RegistrationFormProps {
  onSwitchToLogin: () => void
}

export function RegistrationForm({ onSwitchToLogin }: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [role, setRole] = useState("")
  const [organizationId, setOrganizationId] = useState("")
  const [cityId, setCityId] = useState("")

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    // Add the select values to form data
    formData.set("role", role)
    formData.set("organizationId", organizationId)
    formData.set("cityId", cityId)

    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" type="text" required placeholder="Enter your first name" />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" type="text" required placeholder="Enter your last name" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="Enter your email" />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Create a password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole} required>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="coordinator">Coordinator</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="organizationId">Organization</Label>
          <Select value={organizationId} onValueChange={setOrganizationId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select your organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Gutenberg Foundation</SelectItem>
              <SelectItem value="2">Education Initiative</SelectItem>
              <SelectItem value="3">Community Outreach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cityId">City</Label>
          <Select value={cityId} onValueChange={setCityId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">New York</SelectItem>
              <SelectItem value="2">Los Angeles</SelectItem>
              <SelectItem value="3">Chicago</SelectItem>
              <SelectItem value="4">Houston</SelectItem>
              <SelectItem value="5">Phoenix</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SubmitButton />
      </form>

      <div className="text-center">
        <span className="text-sm text-gray-600">Already have an account? </span>
        <button type="button" onClick={onSwitchToLogin} className="text-sm text-blue-600 hover:text-blue-500">
          Sign in
        </button>
      </div>
    </div>
  )
}
