export const runtime = "edge"
import { proxyPublicRequest } from "@/lib/bff"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const sessionId = url.searchParams.get("session_id") ?? ""
  const sp = new URLSearchParams({ session_id: sessionId })
  return proxyPublicRequest(`/projects/${id}/apply/confirm`, { searchParams: sp })
}
