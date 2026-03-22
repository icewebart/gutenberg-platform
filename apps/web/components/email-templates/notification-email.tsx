"use client"

import { BaseEmailTemplate } from "./base-template"

interface NotificationEmailProps {
  userName: string
  notificationTitle: string
  notificationMessage: string
  actionUrl?: string
  actionText?: string
  organizationName: string
  logoUrl?: string
}

export function NotificationEmail({
  userName,
  notificationTitle,
  notificationMessage,
  actionUrl,
  actionText,
  organizationName,
  logoUrl,
}: NotificationEmailProps) {
  return (
    <BaseEmailTemplate organizationName={organizationName} logoUrl={logoUrl}>
      <div style={{ padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e293b",
              lineHeight: "1.2",
            }}
          >
            {notificationTitle}
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
        <div
          style={{
            backgroundColor: "#e3f2fd",
            borderLeft: "4px solid #2196f3",
            borderRadius: "5px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#555555",
              lineHeight: "1.5",
            }}
          >
            {notificationMessage}
          </p>
        </div>

        {/* Action Button */}
        {actionUrl && actionText && (
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <a
              href={actionUrl}
              style={{
                backgroundColor: "#2196f3",
                color: "#ffffff",
                padding: "12px 30px",
                textDecoration: "none",
                borderRadius: "5px",
                fontSize: "16px",
                fontWeight: "bold",
                display: "inline-block",
              }}
            >
              {actionText}
            </a>
          </div>
        )}

        {/* Footer Message */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#555555",
              lineHeight: "1.5",
            }}
          >
            You're receiving this notification because you're subscribed to updates from {organizationName}.
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
