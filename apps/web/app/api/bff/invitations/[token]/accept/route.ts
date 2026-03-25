export const runtime = 'edge'
import { proxyPublicRequest } from "@/lib/bff"

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await request.json()
  return proxyPublicRequest(`/invitations/${token}/accept`, { method: "POST", body })
}
