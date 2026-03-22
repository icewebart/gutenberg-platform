"use client"

import { BaseEmailTemplate } from "./base-template"

interface VerificationEmailProps {
  userName: string
  verificationUrl: string
  organizationName: string
  logoUrl?: string
}

export function VerificationEmail({ userName, verificationUrl, organizationName, logoUrl }: VerificationEmailProps) {
  return (
    <BaseEmailTemplate organizationName={organizationName} logoUrl={logoUrl}>
      <div style={{ padding: "40px" }}>
        {/* Welcome Message */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1e293b",
              lineHeight: "1.2",
            }}
          >
            Verify Your Email Address
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
            <br />
            Thank you for registering with {organizationName}. To complete your registration, please verify your email
            address by clicking the button below:
          </p>
        </div>

        {/* Verification Button */}
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href={verificationUrl}
            style={{
              backgroundColor: "#007bff",
              color: "#ffffff",
              padding: "12px 30px",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            Verify Email Address
          </a>
        </div>

        {/* Alternative Link */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginBottom: "10px" }}>
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style={{ color: "#007bff", fontSize: "14px", wordBreak: "break-all", marginBottom: "20px" }}>
            {verificationUrl}
          </p>
        </div>

        {/* Security Notice */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#94a3b8",
              lineHeight: "1.4",
            }}
          >
            If you didn't create an account with us, please ignore this email.
            <br />
            For security reasons, please do not share this verification link with anyone.
            <br />
            This email was sent to verify your identity for the {organizationName}.
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
