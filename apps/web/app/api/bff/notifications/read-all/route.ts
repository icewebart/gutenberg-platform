export const runtime = 'edge'
import { proxyRequest } from "@/lib/bff"

export async function PATCH() {
  return proxyRequest("/notifications/read-all", { method: "PATCH" })
}
