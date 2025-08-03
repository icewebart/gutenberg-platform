"use client"

import { BaseEmailTemplate } from "./base-template"

interface DigestItem {
  title: string
  description: string
  url?: string
  date?: string
}

interface DigestEmailProps {
  userName: string
  items: DigestItem[]
  period: string
  organizationName?: string
  logoUrl?: string
}

export function DigestEmail({
  userName,
  items,
  period,
  organizationName = "Gutenberg Foundation",
  logoUrl,
}: DigestEmailProps) {
  return (
    <BaseEmailTemplate
      title={`Your ${period} Digest - Gutenberg CRM`}
      organizationName={organizationName}
      logoUrl={logoUrl}
    >
      <div style={{ padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#ede9fe",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                stroke="#8b5cf6"
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
            Your {period} Digest
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#64748b",
              lineHeight: "1.6",
            }}
          >
            Hello {userName}, here's what happened this {period.toLowerCase()}.
          </p>
        </div>

        {/* Digest Items */}
        <div style={{ marginBottom: "32px" }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                {item.description}
              </p>
              {item.date && (
                <p
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  {item.date}
                </p>
              )}
              {item.url && (
                <a
                  href={item.url}
                  style={{
                    color: "#8b5cf6",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Learn more →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div
          style={{
            backgroundColor: "#f0f9ff",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "32px",
            border: "1px solid #0ea5e9",
            borderLeft: "4px solid #0ea5e9",
          }}
        >
          <p style={{ color: "#0c4a6e", fontSize: "14px", margin: "0 0 8px 0", fontWeight: "bold" }}>📊 Summary</p>
          <p style={{ color: "#0c4a6e", fontSize: "14px", margin: "0", lineHeight: "1.5" }}>
            You had {items.length} activities this {period.toLowerCase()}. Keep up the great work!
          </p>
        </div>

        {/* Footer Message */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5" }}>
            You're receiving this digest because you're an active member of {organizationName}.
          </p>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginTop: "10px" }}>
            Keep making a difference!
            <br />
            <strong>The {organizationName} Team</strong>
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
