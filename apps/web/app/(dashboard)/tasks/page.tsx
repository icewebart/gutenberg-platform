"use client"

export const runtime = "edge"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useAuth } from "@/components/auth-context"
import { useMultiTenant } from "@/components/multi-tenant-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Loader2,
  LayoutKanban,
  List,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  Trash2,
  Award,
  Flag,
  User2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvatarGradient } from "@/lib/avatar-gradient"

type Priority = "low" | "medium" | "high"
type Status = "todo" | "in_progress" | "done"

interface Assignee {
  id: string
  name: string
  avatar?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  deadline?: string | null
  points: number
  assignedTo?: string | null
  assignee?: Assignee | null
  createdBy: string
  projectId?: string | null
  completedAt?: string | null
  pointsAwarded: boolean
  createdAt: string
  updatedAt: string
}

interface Member {
  id: string
  name: string
  avatar?: string
}

interface Project {
  id: string
  title: string
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: typeof Flag }> = {
  low: { label: "Low", color: "text-green-600 bg-green-50 border-green-200", icon: Flag },
  medium: { label: "Medium", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Flag },
  high: { label: "High", color: "text-red-600 bg-red-50 border-red-200", icon: Flag },
}

const STATUS_COLUMNS: { id: Status; label: string; icon: typeof Circle }[] = [
  { id: "todo", label: "To Do", icon: Circle },
  { id: "in_progress", label: "In Progress", icon: AlertCircle },
  { id: "done", label: "Done", icon: CheckCircle2 },
]

function getTimelineInfo(deadline?: string | null): { label: string; color: string } | null {
  if (!deadline) return null
  const now = new Date()
  const due = new Date(deadline)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: "text-red-600 bg-red-50 border-red-200" }
  if (diffDays === 0) return { label: "Due today", color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
  if (diffDays === 1) return { label: "Due tomorrow", color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
  return { label: `${diffDays}d left`, color: "text-green-600 bg-green-50 border-green-200" }
}

function TaskCard({
  task,
  onStatusChange,
  onComplete,
  onDelete,
  canManage,
}: {
  task: Task
  onStatusChange: (id: string, status: Status) => void
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  canManage: boolean
}) {
  const timeline = getTimelineInfo(task.deadline)
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const PriorityIcon = priorityCfg.icon

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all space-y-3">
      {/* Priority + Points */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className={cn("text-xs flex items-center gap-1 border", priorityCfg.color)}>
          <PriorityIcon className="h-3 w-3" />
          {priorityCfg.label}
        </Badge>
        {task.points > 0 && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
            <Award className="h-3 w-3" />
            {task.points} pts
          </div>
        )}
      </div>

      {/* Title */}
      <p className={cn("text-sm font-semibold leading-snug", task.status === "done" && "line-through text-gray-400")}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      {/* Timeline + Deadline */}
      {task.deadline && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            {new Date(task.deadline).toLocaleDateString()}
          </div>
          {timeline && task.status !== "done" && (
            <Badge variant="outline" className={cn("text-xs border", timeline.color)}>
              <Clock className="h-2.5 w-2.5 mr-1" />
              {timeline.label}
            </Badge>
          )}
        </div>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
            <AvatarFallback className={`text-white text-xs bg-gradient-to-br ${getAvatarGradient(task.assignee.id)}`}>
              {task.assignee.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-500">{task.assignee.name}</span>
        </div>
      )}

      {/* Actions */}
      {canManage && (
        <div className="flex items-center gap-2 pt-1">
          {task.status !== "done" && (
            <>
              {task.status === "todo" && (
                <button
                  onClick={() => onStatusChange(task.id, "in_progress")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  → Start
                </button>
              )}
              {task.status === "in_progress" && (
                <button
                  onClick={() => onComplete(task.id)}
                  className="text-xs text-green-600 hover:underline font-medium"
                >
                  ✓ Complete
                </button>
              )}
            </>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="ml-auto text-gray-300 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  const { user, hasRole } = useAuth()
  const { currentOrganization } = useMultiTenant()
  const canManage = hasRole("admin") || hasRole("board_member") || hasRole("volunteer")

  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [filter, setFilter] = useState<"all" | "my">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    deadline: "",
    points: "0",
    assignedTo: "",
    projectId: "",
  })
  const [formError, setFormError] = useState("")

  const fetchTasks = useCallback(async () => {
    if (!currentOrganization) return
    try {
      const params = new URLSearchParams({ organizationId: currentOrganization.id })
      if (filter === "my" && user) params.set("myTasks", "true")
      const res = await fetch(`/api/bff/tasks?${params}`)
      if (res.ok) setTasks(await res.json())
    } finally {
      setLoading(false)
    }
  }, [currentOrganization, filter, user])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (!currentOrganization) return
    fetch(`/api/bff/users?organizationId=${currentOrganization.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setMembers)
    fetch(`/api/bff/projects?organizationId=${currentOrganization.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setProjects)
  }, [currentOrganization])

  const filteredTasks = useMemo(() => {
    if (filter === "my" && user) return tasks.filter((t) => t.assignedTo === user.id)
    return tasks
  }, [tasks, filter, user])

  const tasksByStatus = useMemo(() => {
    const map: Record<Status, Task[]> = { todo: [], in_progress: [], done: [] }
    filteredTasks.forEach((t) => { map[t.status]?.push(t) })
    return map
  }, [filteredTasks])

  const handleStatusChange = async (id: string, status: Status) => {
    await fetch(`/api/bff/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/bff/tasks/${id}/complete`, { method: "PATCH" })
    if (res.ok) {
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)))
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/bff/tasks/${id}`, { method: "DELETE" })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const handleCreate = async () => {
    if (!form.title) { setFormError("Title is required."); return }
    if (!currentOrganization) return
    setCreating(true); setFormError("")
    try {
      const res = await fetch("/api/bff/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: currentOrganization.id,
          title: form.title,
          description: form.description,
          priority: form.priority,
          deadline: form.deadline || null,
          points: parseInt(form.points) || 0,
          assignedTo: form.assignedTo || null,
          projectId: form.projectId || null,
        }),
      })
      if (res.ok) {
        await fetchTasks()
        setDialogOpen(false)
        setForm({ title: "", description: "", priority: "medium", deadline: "", points: "0", assignedTo: "", projectId: "" })
      } else {
        const data = await res.json()
        setFormError(data.error || "Failed to create task.")
      }
    } finally {
      setCreating(false)
    }
  }

  const statusColumnColors: Record<Status, string> = {
    todo: "bg-gray-50 border-gray-200",
    in_progress: "bg-blue-50 border-blue-200",
    done: "bg-green-50 border-green-200",
  }

  const statusIconColors: Record<Status, string> = {
    todo: "text-gray-400",
    in_progress: "text-blue-500",
    done: "text-green-500",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="title-page">Tasks</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            {(["all", "my"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  filter === f ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {f === "all" ? "All Tasks" : "My Tasks"}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                view === "kanban" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LayoutKanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Create */}
          {canManage && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <Label>Title *</Label>
                    <Input
                      className="rounded-field"
                      placeholder="Task title"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      className="rounded-field resize-none"
                      rows={3}
                      placeholder="Describe the task..."
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Priority</Label>
                      <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}>
                        <SelectTrigger className="rounded-field"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Low</SelectItem>
                          <SelectItem value="medium">🟡 Medium</SelectItem>
                          <SelectItem value="high">🔴 High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Points</Label>
                      <Input
                        className="rounded-field"
                        type="number"
                        min="0"
                        value={form.points}
                        onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Deadline</Label>
                    <Input
                      className="rounded-field"
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Assign to</Label>
                    <Select value={form.assignedTo} onValueChange={(v) => setForm((f) => ({ ...f, assignedTo: v }))}>
                      <SelectTrigger className="rounded-field"><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {projects.length > 0 && (
                    <div className="space-y-1">
                      <Label>Tag Project</Label>
                      <Select value={form.projectId} onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}>
                        <SelectTrigger className="rounded-field"><SelectValue placeholder="Select project (optional)" /></SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formError && <p className="text-sm text-red-500">{formError}</p>}
                  <Button onClick={handleCreate} disabled={creating} className="w-full btn-primary">
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : view === "kanban" ? (
        /* ── Kanban View ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = tasksByStatus[col.id]
            const StatusIcon = col.icon
            return (
              <div
                key={col.id}
                className={cn("rounded-xl border p-4 space-y-3 min-h-[200px]", statusColumnColors[col.id])}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn("h-4 w-4", statusIconColors[col.id])} />
                    <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                  </div>
                  <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5 border border-gray-200">
                    {colTasks.length}
                  </span>
                </div>
                {colTasks.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">No tasks</p>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      canManage={canManage}
                    />
                  ))
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div className="border rounded-box bg-white overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No tasks found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                  <th className="hidden sm:table-cell text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 font-medium text-gray-600">Deadline</th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 font-medium text-gray-600">Timeline</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 font-medium text-gray-600">Assigned</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Points</th>
                  {canManage && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const timeline = getTimelineInfo(task.deadline)
                  const priorityCfg = PRIORITY_CONFIG[task.priority]
                  return (
                    <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className={cn("font-medium", task.status === "done" && "line-through text-gray-400")}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</div>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <Badge variant="outline" className={cn("text-xs border", priorityCfg.color)}>
                          {priorityCfg.label}
                        </Badge>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize",
                            task.status === "done" ? "bg-green-100 text-green-800 border-green-200" :
                            task.status === "in_progress" ? "bg-blue-100 text-blue-800 border-blue-200" :
                            "bg-gray-100 text-gray-700 border-gray-200"
                          )}
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-gray-500 text-xs">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3">
                        {timeline && task.status !== "done" ? (
                          <Badge variant="outline" className={cn("text-xs border", timeline.color)}>
                            {timeline.label}
                          </Badge>
                        ) : task.status === "done" ? (
                          <span className="text-xs text-green-500">Completed</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={`text-white text-xs bg-gradient-to-br ${getAvatarGradient(task.assignee.id)}`}>
                                {task.assignee.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {task.points > 0 ? (
                          <div className="flex items-center justify-end gap-1 text-yellow-600 font-medium text-xs">
                            <Award className="h-3.5 w-3.5" />
                            {task.points}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            {task.status === "todo" && (
                              <button
                                onClick={() => handleStatusChange(task.id, "in_progress")}
                                className="text-xs text-blue-500 hover:underline whitespace-nowrap"
                              >
                                Start
                              </button>
                            )}
                            {task.status === "in_progress" && (
                              <button
                                onClick={() => handleComplete(task.id)}
                                className="text-xs text-green-600 hover:underline font-medium whitespace-nowrap"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
