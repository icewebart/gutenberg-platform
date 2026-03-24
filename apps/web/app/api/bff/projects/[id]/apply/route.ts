export const runtime = "edge"
import { proxyPublicRequest } from "@/lib/bff"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  return proxyPublicRequest(`/projects/${id}/apply`, { method: "POST", body })
}
