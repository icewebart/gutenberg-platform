export const runtime = "edge"
import { proxyRequest } from "@/lib/bff"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; appId: string }> }) {
  const { id, appId } = await params
  const body = await request.json()
  return proxyRequest(`/projects/${id}/applications/${appId}`, { method: "PATCH", body })
}
