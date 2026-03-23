export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(`/organizations/${id}`)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  return proxyRequest(`/organizations/${id}`, { method: "PATCH", body })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(`/organizations/${id}`, { method: "DELETE" })
}
