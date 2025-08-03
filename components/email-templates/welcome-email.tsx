"use client"

import { BaseEmailTemplate } from "./base-template"

interface WelcomeEmailProps {
  userName: string
  userEmail: string
  loginUrl: string
  organizationName?: string
  logoUrl?: string
}

export function WelcomeEmail({
  userName,
  userEmail,
  loginUrl,
  organizationName = "Gutenberg Foundation",
  logoUrl,
}: WelcomeEmailProps) {
  return (
    <BaseEmailTemplate title="Welcome to Gutenberg CRM" organizationName={organizationName} logoUrl={logoUrl}>
      <div style={{ padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#f0fdf4",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#16a34a"
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
            Welcome to {organizationName}!
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#64748b",
              lineHeight: "1.6",
            }}
          >
            Hello {userName}, we're excited to have you on board!
          </p>
        </div>

        {/* Main Message */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
            Your account has been successfully created and verified. You now have access to our volunteer management
            platform where you can:
          </p>

          <ul
            style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px", paddingLeft: "20px" }}
          >
            <li>Manage volunteer activities and projects</li>
            <li>Connect with other volunteers in your community</li>
            <li>Access learning resources and training materials</li>
            <li>Track your volunteer hours and achievements</li>
            <li>Participate in community discussions</li>
          </ul>

          <p style={{ color: "#555555", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
            Your account details:
            <br />
            <strong>Email:</strong> {userEmail}
          </p>
        </div>

        {/* Login Button */}
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href={loginUrl}
            style={{
              backgroundColor: "#16a34a",
              color: "#ffffff",
              padding: "16px 32px",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              display: "inline-block",
              boxShadow: "0 4px 6px rgba(22, 163, 74, 0.3)",
            }}
          >
            Access Your Dashboard
          </a>
        </div>

        {/* Getting Started */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "32px",
            border: "1px solid #e2e8f0",
          }}
        >
          <p style={{ color: "#374151", fontSize: "14px", margin: "0 0 8px 0", fontWeight: "bold" }}>
            🚀 Getting Started Tips:
          </p>
          <ul style={{ color: "#374151", fontSize: "14px", margin: "0", lineHeight: "1.5", paddingLeft: "20px" }}>
            <li>Complete your profile to help others connect with you</li>
            <li>Browse available volunteer opportunities</li>
            <li>Join community discussions in your area</li>
            <li>Check out our learning center for training resources</li>
          </ul>
        </div>

        {/* Footer Message */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5" }}>
            If you have any questions or need help getting started, don't hesitate to reach out to our support team.
          </p>
          <p style={{ color: "#555555", fontSize: "14px", lineHeight: "1.5", marginTop: "10px" }}>
            Thank you for joining our mission!
            <br />
            <strong>The {organizationName} Team</strong>
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
