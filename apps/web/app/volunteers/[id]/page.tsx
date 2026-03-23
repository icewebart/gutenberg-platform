"use client"

export const runtime = "edge"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function VolunteerRedirectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/members/${id}`)
  }, [id, router])

  return null
}
