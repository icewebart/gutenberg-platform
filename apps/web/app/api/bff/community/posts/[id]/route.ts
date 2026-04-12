export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(`/community/posts/${id}`)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(`/community/posts/${id}`, { method: "DELETE" })
}
