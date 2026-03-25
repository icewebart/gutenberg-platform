"use client"
export const runtime = "edge"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found in the link.")
      return
    }

    fetch(`/api/bff/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success")
          setMessage("Your email has been verified successfully. You can now log in.")
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed. The link may have expired.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      })
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-sm border-gray-200">
        <CardContent className="pt-10 pb-10 px-8 text-center space-y-5">
          {/* Logo */}
          <div className="text-lg font-bold text-purple-700 tracking-tight mb-2">
            Gutenberg Platform
          </div>

          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
              <p className="text-gray-600 text-sm">Verifying your email…</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Email verified!</h1>
                <p className="text-sm text-gray-500 mt-2">{message}</p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
              >
                Go to login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-14 w-14 text-red-400 mx-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Verification failed</h1>
                <p className="text-sm text-gray-500 mt-2">{message}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full rounded-xl"
              >
                Back to login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
