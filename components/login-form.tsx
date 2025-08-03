"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { signIn } from "@/app/auth/actions"
import { useAuth } from "@/components/auth-context"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  )
}

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToForgotPassword: () => void
}

export function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null)
  const { signInWithDemo } = useAuth()

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  async function handleDemoLogin(email: string) {
    try {
      await signInWithDemo(email)
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="Enter your email" />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required placeholder="Enter your password" />
        </div>

        <SubmitButton />
      </form>

      <div className="text-center">
        <button type="button" onClick={onSwitchToForgotPassword} className="text-sm text-blue-600 hover:text-blue-500">
          Forgot your password?
        </button>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm text-gray-600 text-center">Demo Accounts:</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("sarah@gutenberg.org")}
            className="text-xs"
          >
            Admin (Sarah)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("michael@gutenberg.org")}
            className="text-xs"
          >
            Manager (Michael)
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDemoLogin("emma@gutenberg.org")} className="text-xs">
            Coordinator (Emma)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin("david@gutenberg.org")}
            className="text-xs"
          >
            Volunteer (David)
          </Button>
        </div>
      </div>

      <div className="text-center">
        <span className="text-sm text-gray-600">Don't have an account? </span>
        <button type="button" onClick={onSwitchToRegister} className="text-sm text-blue-600 hover:text-blue-500">
          Sign up
        </button>
      </div>
    </div>
  )
}
