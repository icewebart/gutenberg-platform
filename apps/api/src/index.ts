import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { ensureSeedData } from "./db/seed"

// Routes
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import organizationRoutes from "./routes/organizations"
import projectRoutes from "./routes/projects"
import communityRoutes from "./routes/community"
import courseRoutes from "./routes/courses"
import chatRoutes from "./routes/chat"
import taskRoutes from "./routes/tasks"
import stripeRoutes from "./routes/stripe"
import invitationRoutes from "./routes/invitations"
import notificationRoutes from "./routes/notifications"

const app = express()
const PORT = process.env.PORT ?? 4000

// ─── Stripe webhook (raw body — MUST be before express.json()) ────────────────

app.use("/stripe", express.raw({ type: "application/json" }), stripeRoutes)

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet())
app.use(cors({
  origin: process.env.WEB_URL ?? "http://localhost:3000",
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/organizations", organizationRoutes)
app.use("/projects", projectRoutes)
app.use("/community", communityRoutes)
app.use("/courses", courseRoutes)
app.use("/conversations", chatRoutes)
app.use("/tasks", taskRoutes)
app.use("/invitations", invitationRoutes)
app.use("/notifications", notificationRoutes)
// Note: /stripe routes are registered above (before express.json()) for raw body parsing

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  await ensureSeedData()
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error("Failed to start server:", err)
  process.exit(1)
})
