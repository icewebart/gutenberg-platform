import { jwtVerify } from "jose"
import { NextResponse, type NextRequest } from "next/server"

const PROTECTED_PATHS = [
  "/dashboard",
  "/organizations",
  "/members",
  "/projects",
  "/my-projects",
  "/netzwerk",
  "/community",
  "/learning",
  "/store",
  "/chat",
  "/settings",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow BFF API routes to handle their own auth
  if (pathname.startsWith("/api/bff/")) return NextResponse.next()

  // Login page — redirect to /dashboard if already authenticated
  if (pathname === "/") {
    const token = request.cookies.get("gutenberg_session")?.value
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch {
        // Invalid token — let them see the login page
      }
    }
    return NextResponse.next()
  }

  // Protect dashboard routes
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  )

  if (isProtected) {
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
