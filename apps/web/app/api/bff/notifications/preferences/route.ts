export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET() {
  return proxyRequest("/notifications/preferences")
}

export async function PATCH(request: Request) {
  const body = await request.json()
  return proxyRequest("/notifications/preferences", { method: "PATCH", body })
}
