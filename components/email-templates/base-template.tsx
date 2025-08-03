"use client"

import type React from "react"

interface BaseEmailTemplateProps {
  children: React.ReactNode
  title?: string
  organizationName?: string
  logoUrl?: string
}

export function BaseEmailTemplate({
  children,
  title = "Gutenberg CRM",
  organizationName = "Gutenberg Foundation",
  logoUrl,
}: BaseEmailTemplateProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .logo {
            width: 60px;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 0;
          }
          .footer {
            background-color: #f8fafc;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #2563eb;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">
              {logoUrl ? (
                <img
                  src={logoUrl || "/placeholder.svg"}
                  alt={organizationName}
                  style={{ width: "40px", height: "40px" }}
                />
              ) : (
                "G"
              )}
            </div>
            <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>{organizationName}</h1>
            <p style={{ margin: "10px 0 0 0", opacity: "0.9", fontSize: "16px" }}>Volunteer Management System</p>
          </div>

          <div className="content">{children}</div>

          <div className="footer">
            <p>© 2024 {organizationName}. All rights reserved.</p>
            <p style={{ marginTop: "10px" }}>This email was sent from our volunteer management system.</p>
          </div>
        </div>
      </body>
    </html>
  )
}
