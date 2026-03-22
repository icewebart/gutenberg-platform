"use client"

import { BaseTemplate } from "./base-template"

interface PasswordResetEmailProps {
  userName: string
  resetUrl: string
  organizationName: string
  logoUrl?: string
}

export function PasswordResetEmail({ userName, resetUrl, organizationName, logoUrl }: PasswordResetEmailProps) {
  return (
    <BaseTemplate organizationName={organizationName} logoUrl={logoUrl}>
      <h2 style={{ color: "#333333", fontSize: "20px", marginBottom: "20px" }}>Password Reset Request</h2>

      <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>Hello {userName},</p>

      <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
        We received a request to reset your password for your {organizationName} account. If you made this request,
        click the button below to reset your password:
      </p>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href={resetUrl}
          style={{
            backgroundColor: "#dc3545",
            color: "#ffffff",
            padding: "12px 30px",
            textDecoration: "none",
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          Reset Password
        </a>
      </div>

      <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginBottom: "10px" }}>
        If the button doesn't work, you can also copy and paste this link into your browser:
      </p>

      <p style={{ color: "#007bff", fontSize: "14px", wordBreak: "break-all", marginBottom: "20px" }}>{resetUrl}</p>

      <div
        style={{
          backgroundColor: "#fff3cd",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #ffeaa7",
        }}
      >
        <p style={{ color: "#856404", fontSize: "14px", margin: "0", fontWeight: "bold" }}>Security Notice:</p>
        <p style={{ color: "#856404", fontSize: "14px", margin: "5px 0 0 0" }}>
          This password reset link will expire in 24 hours. If you didn't request this reset, please ignore this email
          and your password will remain unchanged.
        </p>
      </div>

      <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5" }}>
        If you continue to have problems, please contact our support team.
      </p>
    </BaseTemplate>
  )
}
