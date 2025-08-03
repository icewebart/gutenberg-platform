import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"
import { MultiTenantProvider } from "@/components/multi-tenant-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gutenberg CRM - Volunteer Management System",
  description: "A comprehensive volunteer management system for the Gutenberg Foundation",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <MultiTenantProvider>{children}</MultiTenantProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
