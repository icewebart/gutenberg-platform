export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET(request: Request) {
  return proxyRequest("/notifications")
}
