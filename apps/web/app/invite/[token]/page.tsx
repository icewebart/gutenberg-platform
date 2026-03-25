"use client"
export const runtime = "edge"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Building2, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface InviteDetails {
  email: string
  role: string
  organizationId: string
  organizationName: string
  expiresAt: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  board_member: "Board Member",
  volunteer: "Volunteer",
  participant: "Participant",
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [invite, setInvite] = useState<InviteDetails | null>(null)
  const [loadError, setLoadError] = useState("")
  const [loading, setLoading] = useState(true)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`/api/bff/invitations/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setLoadError(data.error)
        else setInvite(data)
      })
      .catch(() => setLoadError("Failed to load invitation"))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async () => {
    if (!firstName.trim() || !lastName.trim()) { setError("First and last name are required"); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (password !== confirmPassword) { setError("Passwords do not match"); return }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/bff/invitations/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create account")
        return
      }

      // Store JWT and redirect to dashboard
      if (data.token) {
        document.cookie = `gutenberg_session=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      }
      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (loadError || !invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="pt-10 pb-10 text-center space-y-3">
            <p className="text-lg font-semibold text-gray-800">Invitation unavailable</p>
            <p className="text-sm text-gray-500">{loadError || "This invitation is invalid or has expired."}</p>
            <Button variant="outline" onClick={() => router.push("/login")} className="rounded-xl mt-2">
              Go to login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Welcome aboard!</h1>
              <p className="text-sm text-gray-500 mt-2">Your account has been created. Redirecting to dashboard…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Header */}
        <div className="text-center">
          <p className="text-lg font-bold text-purple-700 tracking-tight">Gutenberg Platform</p>
        </div>

        {/* Invite info */}
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{invite.organizationName}</p>
                <p className="text-xs text-gray-500 mt-0.5">You've been invited as</p>
              </div>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 border text-xs pointer-events-none">
                {ROLE_LABELS[invite.role] ?? invite.role}
              </Badge>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Joining as: <span className="font-medium text-gray-700">{invite.email}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Registration form */}
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg font-semibold">Create your account</CardTitle>
            <CardDescription className="text-sm text-gray-500">Fill in your details to accept the invitation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">First Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ana"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Popescu"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Password <span className="text-red-500">*</span></Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Confirm Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleAccept}
              disabled={submitting}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-5 gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating account…" : "Accept Invitation"}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Already have an account?{" "}
              <a href="/login" className="text-purple-600 hover:underline">Log in</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
