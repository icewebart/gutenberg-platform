"use client"

import { BaseEmailTemplate } from "./base-template"

interface NotificationEmailProps {
  userName: string
  title: string
  message: string
  actionUrl?: string
  actionText?: string
  organizationName?: string
  logoUrl?: string
}

export function NotificationEmail({
  userName,
  title,
  message,
  actionUrl,
  actionText = "View Details",
  organizationName = "Gutenberg Foundation",
  logoUrl,
}: NotificationEmailProps) {
  return (
    <BaseEmailTemplate title={`${title} - Gutenberg CRM`} organizationName={organizationName} logoUrl={logoUrl}>
      <div style={{ padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#fef3c7",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e293b",
              lineHeight: "1.2",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#64748b",
              lineHeight: "1.6",
            }}
          >
            Hello {userName},
          </p>
        </div>

        {/* Main Message */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>{message}</p>
        </div>

        {/* Action Button */}
        {actionUrl && (
          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <a
              href={actionUrl}
              style={{
                backgroundColor: "#f59e0b",
                color: "#ffffff",
                padding: "16px 32px",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                display: "inline-block",
                boxShadow: "0 4px 6px rgba(245, 158, 11, 0.3)",
              }}
            >
              {actionText}
            </a>
          </div>
        )}

        {/* Footer Message */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5" }}>
            This notification was sent from your {organizationName} account.
          </p>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginTop: "10px" }}>
            Best regards,
            <br />
            <strong>The {organizationName} Team</strong>
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
