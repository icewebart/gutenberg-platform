export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  return proxyRequest("/courses", { searchParams })
}

export async function POST(request: Request) {
  const body = await request.json()
  return proxyRequest("/courses", { method: "POST", body })
}
