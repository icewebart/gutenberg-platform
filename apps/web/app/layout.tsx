import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"
import { MultiTenantProvider } from "@/components/multi-tenant-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gutenberg CRM",
  description: "Volunteer and Project Management Platform",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`} suppressHydrationWarning>
        <AuthProvider>
          <MultiTenantProvider>{children}</MultiTenantProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
