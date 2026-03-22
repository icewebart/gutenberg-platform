import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db, users, organizations } from "./index"

export async function ensureSeedData() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  const orgName = process.env.SEED_ORG_NAME || "Gutenberg Platform"
  const orgDomain = process.env.SEED_ORG_DOMAIN || "gutenberg.org"

  if (!adminEmail || !adminPassword) {
    console.log("Seed vars not set — skipping seed")
    return
  }

  // Ensure default organization exists
  let org = await db.query.organizations.findFirst({
    where: eq(organizations.domain, orgDomain),
  })

  if (!org) {
    const [created] = await db
      .insert(organizations)
      .values({ name: orgName, domain: orgDomain })
      .returning()
    org = created
    console.log(`Created organization: ${org.name}`)
  }

  // Ensure admin user exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  })

  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 12)
    await db.insert(users).values({
      email: adminEmail,
      passwordHash: hash,
      name: "Admin",
      role: "admin",
      department: "Board",
      organizationId: org.id,
      permissions: ["*"],
      isActive: true,
      isVerified: true,
    })
    console.log(`Created admin user: ${adminEmail}`)
  }
}
