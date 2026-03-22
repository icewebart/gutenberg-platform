export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET() {
  return proxyRequest("/conversations")
}

export async function POST(request: Request) {
  const body = await request.json()
  return proxyRequest("/conversations", { method: "POST", body })
}
