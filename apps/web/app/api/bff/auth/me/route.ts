export const runtime = 'edge'
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.API_URL ?? "http://localhost:4000"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("gutenberg_session")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
