export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  const { id, commentId } = await params
  return proxyRequest(`/tasks/${id}/comments/${commentId}`, { method: "DELETE" })
}
