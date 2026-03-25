export const runtime = 'edge'
import { proxyPublicRequest } from "@/lib/bff"
import { proxyRequest } from "@/lib/bff"

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return proxyPublicRequest(`/invitations/${token}`)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return proxyRequest(`/invitations/${token}`, { method: "DELETE" })
}
