export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(`/conversations/${id}/messages`)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  return proxyRequest(`/conversations/${id}/messages`, { method: "POST", body })
}
