import { Resend } from "resend"

const FROM = process.env.FROM_EMAIL ?? "Gutenberg Platform <noreply@gutenberg.ro>"

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY is not set")
  return new Resend(key)
}

// ─── Base layout ─────────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Gutenberg Platform</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          ${body}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            You received this email from Gutenberg Platform.<br/>
            If you didn't expect this, you can safely ignore it.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#7c3aed;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:8px;margin:24px 0;">${label}</a>`
}

// ─── Send: Email Verification ─────────────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
  webUrl: string
) {
  const link = `${webUrl}/verify-email?token=${token}`
  const html = layout("Confirm your email", `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Hi ${name}, welcome! 👋</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Thanks for joining Gutenberg Platform. Please confirm your email address to activate your account.
    </p>
    <div style="text-align:center;">${btn(link, "Confirm Email Address")}</div>
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
      This link expires in 24 hours.<br/>
      Or copy this URL: <a href="${link}" style="color:#7c3aed;">${link}</a>
    </p>
  `)
  await getResend().emails.send({ from: FROM, to: email, subject: "Confirm your email — Gutenberg Platform", html })
}

// ─── Send: Invitation ─────────────────────────────────────────────────────────

export async function sendInvitationEmail(
  email: string,
  inviterName: string,
  orgName: string,
  role: string,
  token: string,
  webUrl: string
) {
  const link = `${webUrl}/invite/${token}`
  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  const html = layout("You've been invited", `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">You've been invited to join ${orgName}</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> as a <strong>${roleLabel}</strong> on Gutenberg Platform.
    </p>
    <div style="text-align:center;">${btn(link, "Accept Invitation")}</div>
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
      This invitation expires in 7 days.<br/>
      Or copy this URL: <a href="${link}" style="color:#7c3aed;">${link}</a>
    </p>
  `)
  await getResend().emails.send({ from: FROM, to: email, subject: `${inviterName} invited you to ${orgName}`, html })
}

// ─── Send: Application Approved ───────────────────────────────────────────────

export async function sendApplicationApprovedEmail(
  email: string,
  name: string,
  projectTitle: string,
  tempPassword: string,
  webUrl: string
) {
  const html = layout("Application approved!", `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Great news, ${name}! 🎉</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Your application for <strong>${projectTitle}</strong> has been <strong style="color:#059669;">approved</strong>.
      We've created an account for you on Gutenberg Platform.
    </p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Your login credentials:</p>
      <p style="margin:0 0 4px;font-size:15px;color:#111827;"><strong>Email:</strong> ${email}</p>
      <p style="margin:0;font-size:15px;color:#111827;"><strong>Temporary password:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
    </div>
    <div style="text-align:center;">${btn(`${webUrl}/login`, "Log in to your account")}</div>
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">Please change your password after your first login.</p>
  `)
  await getResend().emails.send({ from: FROM, to: email, subject: `Your application for ${projectTitle} was approved!`, html })
}

// ─── Send: Application Rejected ───────────────────────────────────────────────

export async function sendApplicationRejectedEmail(
  email: string,
  name: string,
  projectTitle: string
) {
  const html = layout("Application update", `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Hi ${name},</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Thank you for your interest in <strong>${projectTitle}</strong>. After careful review, we're unable to accept your application at this time.
    </p>
    <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
      We encourage you to apply for future projects and hope to work with you soon.
    </p>
  `)
  await getResend().emails.send({ from: FROM, to: email, subject: `Update on your application for ${projectTitle}`, html })
}
