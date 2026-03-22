export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function GET() {
  return proxyRequest("/organizations")
}
