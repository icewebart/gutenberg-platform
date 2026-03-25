export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = new URLSearchParams()
  const orgId = url.searchParams.get("organizationId")
  if (orgId) params.set("organizationId", orgId)
  return proxyRequest("/invitations", { searchParams: params })
}

export async function POST(request: Request) {
  const body = await request.json()
  return proxyRequest("/invitations", { method: "POST", body })
}
