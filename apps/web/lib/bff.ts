import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.API_URL ?? "http://localhost:4000"

export async function proxyRequest(
  path: string,
  options: { method?: string; body?: unknown; searchParams?: URLSearchParams } = {}
): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get("gutenberg_session")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = options.searchParams
    ? `${API_URL}${path}?${options.searchParams}`
    : `${API_URL}${path}`

  try {
    const res = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (res.status === 204) return new NextResponse(null, { status: 204 })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
