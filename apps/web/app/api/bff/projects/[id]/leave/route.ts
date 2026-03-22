import { proxyRequest } from "@/lib/bff"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyRequest(`/projects/${id}/leave`, { method: "POST" })
}
