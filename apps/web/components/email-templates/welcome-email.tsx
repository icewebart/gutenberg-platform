"use client"

import { BaseEmailTemplate } from "./base-template"

interface WelcomeEmailProps {
  userName: string
  organizationName: string
  dashboardUrl: string
  logoUrl?: string
}

export function WelcomeEmail({ userName, organizationName, dashboardUrl, logoUrl }: WelcomeEmailProps) {
  return (
    <BaseEmailTemplate organizationName={organizationName} logoUrl={logoUrl}>
      <div style={{ padding: "40px" }}>
        {/* Welcome Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#dcfce7",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="22,4 12,14.01 9,11.01"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "36px",
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
              fontSize: "20px",
              color: "#64748b",
              lineHeight: "1.6",
            }}
          >
            Hello {userName},
            <br />
            Welcome to our multi-tenant platform! Your account has been successfully created and verified.
            <br />
            You can now access all the features available to your role.
          </p>
        </div>

        {/* Getting Started */}
        <div style={{ marginBottom: "32px" }}>
          <h3
            style={{
              margin: "0 0 24px",
              fontSize: "22px",
              fontWeight: "600",
              color: "#1e293b",
            }}
          >
            🚀 Getting Started
          </h3>
          <div style={{ display: "grid", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                1. Complete Your Profile
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                Add a profile picture, update your bio, and let others know about your interests and skills.
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                borderLeft: "4px solid #10b981",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                2. Explore Available Projects
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                Browse ongoing projects and find opportunities to contribute your skills and learn new ones.
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                3. Connect with Other Community Members
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                Introduce yourself in the community forum and start connecting with fellow students.
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "20px",
                borderLeft: "4px solid #8b5cf6",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                4. Access Learning Resources and Courses
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                Participate in activities, help others, and earn credits to redeem for awesome rewards in our store.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <a
            href={dashboardUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              textDecoration: "none",
              padding: "16px 32px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)",
            }}
          >
            Access Dashboard
          </a>
        </div>

        {/* Support */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: "16px",
              color: "#475569",
              lineHeight: "1.6",
            }}
          >
            Questions? We're here to help!
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            Contact us at{" "}
            <a href="mailto:support@gutenberg.edu" style={{ color: "#3b82f6", fontWeight: "600" }}>
              support@gutenberg.edu
            </a>{" "}
            or visit our{" "}
            <a href="#" style={{ color: "#3b82f6", fontWeight: "600" }}>
              Help Center
            </a>
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  )
}
