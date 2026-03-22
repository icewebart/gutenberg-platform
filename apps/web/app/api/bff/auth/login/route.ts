export const runtime = 'edge'
import { NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:4000"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json(data, { status: res.status })

    const response = NextResponse.json({ user: data.user })
    response.cookies.set("gutenberg_session", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
