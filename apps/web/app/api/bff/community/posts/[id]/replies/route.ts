import { proxyRequest } from "@/lib/bff"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  return proxyRequest(`/community/posts/${id}/replies`, { method: "POST", body })
}
