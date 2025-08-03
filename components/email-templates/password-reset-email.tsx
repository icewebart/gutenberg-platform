"use client"

import { BaseEmailTemplate } from "./base-template"

interface PasswordResetEmailProps {
  resetLink: string
  userEmail: string
  userName?: string
  organizationName?: string
  logoUrl?: string
}

export function PasswordResetEmail({
  resetLink,
  userEmail,
  userName = "User",
  organizationName = "Gutenberg Foundation",
  logoUrl,
}: PasswordResetEmailProps) {
  return (
    <BaseEmailTemplate title="Password Reset - Gutenberg CRM" organizationName={organizationName} logoUrl={logoUrl}>
      <div style={{ padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#fef2f2",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#dc2626" strokeWidth="2" />
              <circle cx="12" cy="16" r="1" fill="#dc2626" />
              <path
                d="M7 11V7a5 5 0 0 1 10 0v4"
                stroke="#dc2626"
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
            Password Reset Request
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
          <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
            We received a request to reset the password for your account ({userEmail}).
          </p>
          <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
            Click the button below to reset your password. This link will expire in 1 hour for security reasons.
          </p>
        </div>

        {/* Reset Button */}
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href={resetLink}
            style={{
              backgroundColor: "#dc2626",
              color: "#ffffff",
              padding: "16px 32px",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              display: "inline-block",
              boxShadow: "0 4px 6px rgba(220, 38, 38, 0.3)",
            }}
          >
            Reset Password
          </a>
        </div>

        {/* Alternative Link */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginBottom: "10px" }}>
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p
            style={{
              color: "#dc2626",
              fontSize: "14px",
              wordBreak: "break-all",
              marginBottom: "20px",
              backgroundColor: "#f8fafc",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #e2e8f0",
            }}
          >
            {resetLink}
          </p>
        </div>

        {/* Security Notice */}
        <div
          style={{
            backgroundColor: "#fef3c7",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "32px",
            border: "1px solid #fbbf24",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <p style={{ color: "#92400e", fontSize: "14px", margin: "0 0 8px 0", fontWeight: "bold" }}>
            🔒 Security Notice:
          </p>
          <ul style={{ color: "#92400e", fontSize: "14px", margin: "0", lineHeight: "1.5", paddingLeft: "20px" }}>
            <li>This password reset link will expire in 1 hour</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Your password will remain unchanged if you don't click the link</li>
            <li>For your security, please do not share this link with anyone</li>
          </ul>
        </div>

        {/* Footer Message */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5" }}>
            If you continue to have problems or didn't request this reset, please contact our support team.
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
