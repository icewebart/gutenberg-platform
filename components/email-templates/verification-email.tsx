"use client"

import { BaseEmailTemplate } from "./base-template"

interface VerificationEmailProps {
  verificationLink: string
  userEmail: string
  userName?: string
  organizationName?: string
  logoUrl?: string
}

export function VerificationEmail({
  verificationLink,
  userEmail,
  userName = "User",
  organizationName = "Gutenberg Foundation",
  logoUrl,
}: VerificationEmailProps) {
  return (
    <BaseEmailTemplate title="Verify Your Email - Gutenberg CRM" organizationName={organizationName} logoUrl={logoUrl}>
      <div style={{ padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e293b",
              lineHeight: "1.2",
            }}
          >
            Verify Your Email
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#64748b",
              lineHeight: "1.6",
            }}
          >
            Welcome to {organizationName}, {userName}!
          </p>
        </div>

        {/* Main Message */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
            Thank you for creating an account with us. To complete your registration and start using the platform,
            please verify your email address by clicking the button below.
          </p>
          <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
            Your account: <strong>{userEmail}</strong>
          </p>
        </div>

        {/* Verification Button */}
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href={verificationLink}
            style={{
              backgroundColor: "#0ea5e9",
              color: "#ffffff",
              padding: "16px 32px",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              display: "inline-block",
              boxShadow: "0 4px 6px rgba(14, 165, 233, 0.3)",
            }}
          >
            Verify Email Address
          </a>
        </div>

        {/* Alternative Link */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginBottom: "10px" }}>
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p
            style={{
              color: "#0ea5e9",
              fontSize: "14px",
              wordBreak: "break-all",
              marginBottom: "20px",
              backgroundColor: "#f8fafc",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #e2e8f0",
            }}
          >
            {verificationLink}
          </p>
        </div>

        {/* Info Notice */}
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
          <p style={{ color: "#0c4a6e", fontSize: "14px", margin: "0 0 8px 0", fontWeight: "bold" }}>
            ℹ️ What happens next?
          </p>
          <ul style={{ color: "#0c4a6e", fontSize: "14px", margin: "0", lineHeight: "1.5", paddingLeft: "20px" }}>
            <li>Click the verification link above</li>
            <li>You'll be redirected to our platform</li>
            <li>Your account will be activated automatically</li>
            <li>You can start using all features immediately</li>
          </ul>
        </div>

        {/* Footer Message */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5" }}>
            If you didn't create this account, please ignore this email.
          </p>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginTop: "10px" }}>
            Welcome aboard!
            <br />
            <strong>The {organizationName} Team</strong>
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
