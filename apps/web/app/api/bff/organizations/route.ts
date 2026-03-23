export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET() {
  return proxyRequest("/organizations")
}

export async function POST(request: Request) {
  const body = await request.json()
  return proxyRequest("/organizations", { method: "POST", body })
}
