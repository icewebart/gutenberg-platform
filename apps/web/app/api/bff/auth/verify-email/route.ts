export const runtime = 'edge'
import { proxyPublicRequest } from "@/lib/bff"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  const params = new URLSearchParams({ token })
  return proxyPublicRequest("/auth/verify-email", { searchParams: params })
}
