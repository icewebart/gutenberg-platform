import { jwtVerify } from "jose"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_PATHS = ["/", "/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  // Allow BFF API routes to handle their own auth
  if (pathname.startsWith("/api/bff/")) return NextResponse.next()

  const token = request.cookies.get("gutenberg_session")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.delete("gutenberg_session")
    return response
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
