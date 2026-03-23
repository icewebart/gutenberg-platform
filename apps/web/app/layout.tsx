import type React from "react"
import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"
import { MultiTenantProvider } from "@/components/multi-tenant-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-body" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-title", weight: ["600", "700", "800"] })

export const metadata: Metadata = {
  title: "Gutenberg CRM",
  description: "Volunteer and Project Management Platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.variable} ${jakarta.variable} ${inter.className} h-full`} suppressHydrationWarning>
        <AuthProvider>
          <MultiTenantProvider>{children}</MultiTenantProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
