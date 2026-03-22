"use client"

import { BaseEmailTemplate } from "./base-template"

interface DigestItem {
  type: "project" | "post" | "event" | "achievement"
  title: string
  description: string
  date: string
  author?: string
  url?: string
}

interface DigestEmailProps {
  userName: string
  organizationName: string
  digestItems: DigestItem[]
  logoUrl?: string
}

export function DigestEmail({ userName, organizationName, digestItems, logoUrl }: DigestEmailProps) {
  return (
    <BaseEmailTemplate organizationName={organizationName} logoUrl={logoUrl}>
      <div style={{ padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#f0f9ff",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="16" y1="13" x2="8" y2="13" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="17" x2="8" y2="17" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
              <polyline
                points="10,9 9,9 8,9"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1e293b",
              lineHeight: "1.2",
            }}
          >
            Weekly Digest
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#64748b",
              lineHeight: "1.6",
            }}
          >
            Hello {userName},
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#64748b",
              lineHeight: "1.6",
              marginBottom: "30px",
            }}
          >
            Here's what's been happening in your {organizationName} community this week:
          </p>
        </div>

        {/* Digest Items */}
        <div style={{ marginBottom: "32px" }}>
          {digestItems.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "25px",
                paddingBottom: "20px",
                borderBottom: index < digestItems.length - 1 ? "1px solid #e9ecef" : "none",
              }}
            >
              <h3 style={{ color: "#333333", fontSize: "18px", marginBottom: "10px" }}>
                {item.url ? (
                  <a href={item.url} style={{ color: "#007bff", textDecoration: "none" }}>
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h3>
              <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginBottom: "5px" }}>
                {item.description}
              </p>
              <p style={{ color: "#6c757d", fontSize: "12px", margin: "0" }}>{item.date}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <a
            href="#"
            style={{
              backgroundColor: "#6f42c1",
              color: "#ffffff",
              padding: "12px 30px",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            View Full Dashboard
          </a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#64748b",
              lineHeight: "1.5",
            }}
          >
            Stay engaged with your community and don't miss out on important updates!
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
