"use client"
export const runtime = 'edge'

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, Copy, Check, LogIn } from "lucide-react"

interface SuccessData {
  email: string
  tempPassword: string | null
  status: string
}

export default function ApplySuccessPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [data, setData] = useState<SuccessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPw, setCopiedPw] = useState(false)

  useEffect(() => {
    if (!projectId) return

    if (sessionId) {
      // Stripe paid flow — confirm with API
      fetch(`/api/bff/projects/${projectId}/apply/confirm?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) {
            setError(d.error)
          } else {
            setData({ email: d.email, tempPassword: d.tempPassword, status: d.status })
          }
        })
        .catch(() => setError("Failed to confirm payment"))
        .finally(() => setLoading(false))
    } else {
      // Free flow — read from sessionStorage
      const stored = sessionStorage.getItem(`apply_result_${projectId}`)
      if (stored) {
        try {
          setData(JSON.parse(stored))
          sessionStorage.removeItem(`apply_result_${projectId}`)
        } catch {
          setError("Could not retrieve application details")
        }
      } else {
        setError("No application data found")
      }
      setLoading(false)
    }
  }, [projectId, sessionId])

  const copyToClipboard = (text: string, type: "email" | "pw") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "email") {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else {
        setCopiedPw(true)
        setTimeout(() => setCopiedPw(false), 2000)
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500 mx-auto" />
          <p className="text-gray-500 text-sm">Confirming your registration…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="text-base font-bold text-purple-700 tracking-tight">Gutenberg Platform</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {error ? (
          <Card className="rounded-2xl border-red-200 shadow-sm">
            <CardContent className="pt-8 pb-8 text-center space-y-3">
              <p className="text-red-600 font-medium text-lg">{error}</p>
              <Link href={`/apply/${projectId}`}>
                <Button variant="outline" className="rounded-xl mt-2">
                  Back to Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* Success hero */}
            <div className="text-center space-y-3 py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">You&apos;re registered!</h1>
              {data.status === "approved" ? (
                <p className="text-gray-500">
                  You are confirmed! Log in to access your project dashboard.
                </p>
              ) : (
                <p className="text-gray-500">
                  Your application is pending admin approval. You&apos;ll receive confirmation soon.
                </p>
              )}
              <Badge
                className={
                  data.status === "approved"
                    ? "bg-green-50 text-green-700 border-green-200 border"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200 border"
                }
              >
                {data.status === "approved" ? "Approved" : "Pending Review"}
              </Badge>
            </div>

            {/* Credentials card */}
            <Card className="rounded-2xl border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Your Login Credentials</CardTitle>
                <p className="text-sm text-gray-500">
                  An account has been created for you. Use these details to log in.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Email</p>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <span className="flex-1 font-mono text-sm text-gray-800 truncate">{data.email}</span>
                    <button
                      onClick={() => copyToClipboard(data.email, "email")}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                    >
                      {copiedEmail ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {data.tempPassword && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
                      Temporary Password
                    </p>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <span className="flex-1 font-mono text-sm text-gray-800 tracking-widest">
                        {data.tempPassword}
                      </span>
                      <button
                        onClick={() => copyToClipboard(data.tempPassword!, "pw")}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                      >
                        {copiedPw ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  Please change your password after logging in for the first time.
                </p>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3">
              <Link href="/login" className="w-full max-w-sm">
                <Button className="w-full rounded-xl gap-2 bg-purple-600 hover:bg-purple-700 text-white py-5">
                  <LogIn className="h-4 w-4" />
                  Log in to Gutenberg Platform
                </Button>
              </Link>
              <p className="text-xs text-gray-400">
                Save these credentials before closing this page.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
