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

  // Seed demo users
  const rolePermissions: Record<string, string[]> = {
    board_member: ["manage_volunteers", "view_projects", "manage_netzwerk", "view_community", "view_learning_center", "view_store"],
    volunteer: ["view_projects", "view_community", "view_learning_center", "view_store"],
    participant: ["view_assigned_projects", "view_community", "view_learning_center"],
  }

  const demoUsers = [
    { email: "board@gutenberg.org", password: "board123", name: "Board Member", role: "board_member", department: "Board" },
    { email: "volunteer@gutenberg.org", password: "volunteer123", name: "Volunteer", role: "volunteer", department: "None" },
    { email: "participant@gutenberg.org", password: "participant123", name: "Participant", role: "participant", department: "None" },
  ]

  for (const demo of demoUsers) {
    const exists = await db.query.users.findFirst({ where: eq(users.email, demo.email) })
    if (!exists) {
      const hash = await bcrypt.hash(demo.password, 12)
      await db.insert(users).values({
        email: demo.email,
        passwordHash: hash,
        name: demo.name,
        role: demo.role,
        department: demo.department,
        organizationId: org.id,
        permissions: rolePermissions[demo.role] ?? [],
        isActive: true,
        isVerified: true,
      })
      console.log(`Created demo user: ${demo.email}`)
    } else {
      await db.update(users)
        .set({ permissions: rolePermissions[demo.role] ?? [] })
        .where(eq(users.email, demo.email))
      console.log(`Updated permissions for: ${demo.email}`)
    }
  }
}
