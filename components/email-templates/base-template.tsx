"use client"

import type { ReactNode } from "react"

interface BaseEmailTemplateProps {
  children: ReactNode
  preheader?: string
  organizationName: string
  logoUrl?: string
}

export function BaseEmailTemplate({ children, preheader, organizationName, logoUrl }: BaseEmailTemplateProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{organizationName}</title>
        {preheader && (
          <div
            style={{
              display: "none",
              fontSize: "1px",
              color: "#fefefe",
              lineHeight: "1px",
              fontFamily: "Arial, sans-serif",
              maxHeight: "0px",
              maxWidth: "0px",
              opacity: 0,
              overflow: "hidden",
            }}
          >
            {preheader}
          </div>
        )}
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f8fafc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff" }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              textAlign: "center",
              borderBottom: "1px solid #e9ecef",
            }}
          >
            {logoUrl && (
              <img
                src={logoUrl || "/placeholder.svg"}
                alt={`${organizationName} Logo`}
                style={{ maxHeight: "60px", marginBottom: "10px" }}
              />
            )}
            <h1 style={{ color: "#333333", fontSize: "24px", margin: "0" }}>{organizationName}</h1>
          </div>

          {/* Content */}
          <div style={{ padding: "30px 20px" }}>{children}</div>

          {/* Footer */}
          <div
            style={{ backgroundColor: "#f8f9fa", padding: "20px", textAlign: "center", borderTop: "1px solid #e9ecef" }}
          >
            <p style={{ color: "#6c757d", fontSize: "14px", margin: "0" }}>
              © 2024 {organizationName}. All rights reserved.
            </p>
            <p style={{ color: "#6c757d", fontSize: "12px", margin: "10px 0 0 0" }}>
              This email was sent from our multi-tenant platform.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
