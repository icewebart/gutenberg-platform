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
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Loader2,
  Kanban,
  List,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trash2,
  Award,
  Flag,
  Edit,
  X,
  FolderOpen,
  User,
  CheckCheck,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvatarGradient } from "@/lib/avatar-gradient"
import Link from "next/link"

type Priority = "low" | "medium" | "high"
type Status = "todo" | "in_progress" | "done"

interface Assignee {
  id: string
  name: string
  firstName?: string
  lastName?: string
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
  firstName?: string
  lastName?: string
  avatar?: string
}

interface Project {
  id: string
  title: string
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "text-green-600 bg-green-50 border-green-200" },
  medium: { label: "Medium", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  high:   { label: "High",   color: "text-red-600 bg-red-50 border-red-200" },
}

const STATUS_COLUMNS: { id: Status; label: string; icon: typeof Circle }[] = [
  { id: "todo",        label: "To Do",       icon: Circle },
  { id: "in_progress", label: "In Progress", icon: AlertCircle },
  { id: "done",        label: "Done",        icon: CheckCircle2 },
]

const STATUS_STYLES: Record<Status, string> = {
  todo:        "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  done:        "bg-green-50 text-green-700 border-green-200",
}

function displayName(m: Member | Assignee) {
  if ((m as Member).firstName || (m as Member).lastName)
    return `${(m as Member).firstName ?? ""} ${(m as Member).lastName ?? ""}`.trim()
  return m.name
}

function initials(m: Member | Assignee) {
  const n = displayName(m)
  const parts = n.split(" ")
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : n.slice(0, 2).toUpperCase()
}

function getTimelineInfo(deadline?: string | null): { label: string; color: string } | null {
  if (!deadline) return null
  const diffDays = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diffDays < 0)  return { label: `${Math.abs(diffDays)}d overdue`, color: "text-red-600 bg-red-50 border-red-200" }
  if (diffDays === 0) return { label: "Due today",    color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
  if (diffDays === 1) return { label: "Due tomorrow", color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
  return { label: `${diffDays}d left`, color: "text-green-600 bg-green-50 border-green-200" }
}

// ─── Task Detail / Edit Modal ──────────────────────────────────────────────────

function TaskDetailModal({
  task,
  members,
  projects,
  canManage,
  open,
  onClose,
  onStatusChange,
  onComplete,
  onDelete,
  onSave,
}: {
  task: Task | null
  members: Member[]
  projects: Project[]
  canManage: boolean
  open: boolean
  onClose: () => void
  onStatusChange: (id: string, status: Status) => Promise<void>
  onComplete: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSave: (id: string, data: Partial<Task>) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Edit form state — mirrors the task fields
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPriority, setEditPriority] = useState<Priority>("medium")
  const [editStatus, setEditStatus] = useState<Status>("todo")
  const [editDeadline, setEditDeadline] = useState("")
  const [editPoints, setEditPoints] = useState("0")
  const [editAssignedTo, setEditAssignedTo] = useState("")
  const [editProjectId, setEditProjectId] = useState("")

  // Populate edit form when task changes or edit mode opens
  useEffect(() => {
    if (!task) return
    setEditTitle(task.title)
    setEditDescription(task.description ?? "")
    setEditPriority(task.priority)
    setEditStatus(task.status)
    setEditDeadline(task.deadline ? task.deadline.slice(0, 10) : "")
    setEditPoints(String(task.points))
    setEditAssignedTo(task.assignedTo ?? "")
    setEditProjectId(task.projectId ?? "")
    setEditing(false)
    setConfirmDelete(false)
  }, [task])

  if (!task) return null

  const timeline = getTimelineInfo(task.deadline)
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const linkedProject = projects.find((p) => p.id === task.projectId)
  const createdDate = new Date(task.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
  const completedDate = task.completedAt
    ? new Date(task.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null

  const handleSave = async () => {
    setSaving(true)
    await onSave(task.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      status: editStatus,
      deadline: editDeadline || null,
      points: parseInt(editPoints) || 0,
      assignedTo: editAssignedTo || null,
      projectId: editProjectId || null,
    })
    setSaving(false)
    setEditing(false)
  }

  const handleDelete = async () => {
    await onDelete(task.id)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setEditing(false) } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between gap-3 z-10">
          <div className="flex-1 min-w-0">
            {editing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-base font-semibold rounded-xl"
                placeholder="Task title"
              />
            ) : (
              <h2 className={cn("text-base font-semibold leading-snug", task.status === "done" && "line-through text-gray-400")}>
                {task.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {canManage && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => { onClose(); setEditing(false) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status + Priority row */}
          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Status)}>
                  <SelectTrigger className="w-36 rounded-xl h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Priority)}>
                  <SelectTrigger className="w-32 rounded-xl h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Badge variant="outline" className={cn("text-xs border", STATUS_STYLES[task.status])}>
                  {task.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
                <Badge variant="outline" className={cn("text-xs border flex items-center gap-1", priorityCfg.color)}>
                  <Flag className="h-2.5 w-2.5" />
                  {priorityCfg.label}
                </Badge>
                {task.points > 0 && (
                  <Badge variant="outline" className="text-xs border text-yellow-600 bg-yellow-50 border-yellow-200 flex items-center gap-1">
                    <Award className="h-2.5 w-2.5" />
                    {task.points} pts
                    {task.pointsAwarded && " (awarded)"}
                  </Badge>
                )}
                {timeline && task.status !== "done" && (
                  <Badge variant="outline" className={cn("text-xs border flex items-center gap-1", timeline.color)}>
                    <Clock className="h-2.5 w-2.5" />
                    {timeline.label}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Description</Label>
            {editing ? (
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="rounded-xl resize-none text-sm"
                placeholder="Describe the task…"
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {task.description || <span className="text-gray-400 italic">No description</span>}
              </p>
            )}
          </div>

          <Separator />

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Deadline
              </Label>
              {editing ? (
                <Input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="rounded-xl h-8 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-700">
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : <span className="text-gray-400">Not set</span>}
                </p>
              )}
            </div>

            {/* Points */}
            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Award className="h-3 w-3" /> Points
              </Label>
              {editing ? (
                <Input
                  type="number"
                  min="0"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  className="rounded-xl h-8 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-700">
                  {task.points > 0 ? `${task.points} pts` : <span className="text-gray-400">No points</span>}
                </p>
              )}
            </div>

            {/* Assignee */}
            <div className="col-span-2">
              <Label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <User className="h-3 w-3" /> Assigned to
              </Label>
              {editing ? (
                <Select value={editAssignedTo} onValueChange={setEditAssignedTo}>
                  <SelectTrigger className="rounded-xl h-8 text-sm">
                    <SelectValue placeholder="Select member…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{displayName(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : task.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={task.assignee.avatar || undefined} />
                    <AvatarFallback className={`text-white text-xs bg-gradient-to-br ${getAvatarGradient(task.assignee.id)}`}>
                      {initials(task.assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{displayName(task.assignee)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Unassigned</p>
              )}
            </div>

            {/* Project */}
            <div className="col-span-2">
              <Label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FolderOpen className="h-3 w-3" /> Project
              </Label>
              {editing ? (
                <Select value={editProjectId} onValueChange={setEditProjectId}>
                  <SelectTrigger className="rounded-xl h-8 text-sm">
                    <SelectValue placeholder="Link to project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : linkedProject ? (
                <Link
                  href={`/projects/${linkedProject.id}`}
                  className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                  onClick={onClose}
                >
                  {linkedProject.title}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <p className="text-sm text-gray-400">No project linked</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Created {createdDate}</span>
            {completedDate && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCheck className="h-3 w-3" />
                Completed {completedDate}
              </span>
            )}
          </div>

          {/* Edit mode save/cancel */}
          {editing && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl bg-transparent">
                Cancel
              </Button>
            </div>
          )}

          {/* Action buttons (view mode) */}
          {!editing && canManage && task.status !== "done" && (
            <div className="flex gap-2">
              {task.status === "todo" && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-2 bg-transparent"
                  onClick={async () => { await onStatusChange(task.id, "in_progress"); onClose() }}
                >
                  <ArrowRight className="h-4 w-4" />
                  Start Task
                </Button>
              )}
              {task.status === "in_progress" && (
                <Button
                  className="flex-1 rounded-xl gap-2 bg-green-600 hover:bg-green-700"
                  onClick={async () => { await onComplete(task.id); onClose() }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Complete
                </Button>
              )}
            </div>
          )}

          {/* Delete */}
          {canManage && !editing && (
            <div className="pt-1">
              {confirmDelete ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700 flex-1">Delete this task?</p>
                  <Button size="sm" variant="destructive" className="rounded-lg" onClick={handleDelete}>
                    Delete
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete task
                </button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Task Card (Kanban) ────────────────────────────────────────────────────────

function TaskCard({
  task,
  onOpen,
}: {
  task: Task
  onOpen: (task: Task) => void
}) {
  const timeline = getTimelineInfo(task.deadline)
  const priorityCfg = PRIORITY_CONFIG[task.priority]

  return (
    <button
      onClick={() => onOpen(task)}
      className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3 focus:outline-none focus:ring-2 focus:ring-purple-300"
    >
      {/* Priority + Points */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className={cn("text-xs flex items-center gap-1 border pointer-events-none", priorityCfg.color)}>
          <Flag className="h-3 w-3" />
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
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            {new Date(task.deadline).toLocaleDateString()}
          </div>
          {timeline && task.status !== "done" && (
            <Badge variant="outline" className={cn("text-xs border pointer-events-none", timeline.color)}>
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
            <AvatarImage src={task.assignee.avatar || undefined} />
            <AvatarFallback className={`text-white text-xs bg-gradient-to-br ${getAvatarGradient(task.assignee.id)}`}>
              {initials(task.assignee)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-500">{displayName(task.assignee)}</span>
        </div>
      )}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium" as Priority,
    deadline: "", points: "0", assignedTo: "", projectId: "",
  })
  const [formError, setFormError] = useState("")

  // Detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

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

  useEffect(() => { fetchTasks() }, [fetchTasks])

  useEffect(() => {
    if (!currentOrganization) return
    fetch(`/api/bff/users?organizationId=${currentOrganization.id}`)
      .then((r) => r.ok ? r.json() : []).then(setMembers)
    fetch(`/api/bff/projects?organizationId=${currentOrganization.id}`)
      .then((r) => r.ok ? r.json() : []).then(setProjects)
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

  const openTask = (task: Task) => {
    setSelectedTask(task)
    setDetailOpen(true)
  }

  const handleStatusChange = async (id: string, status: Status) => {
    await fetch(`/api/bff/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t))
    setSelectedTask((prev) => prev?.id === id ? { ...prev, status } : prev)
  }

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/bff/tasks/${id}/complete`, { method: "PATCH" })
    if (res.ok) {
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updated } : t))
      setSelectedTask((prev) => prev?.id === id ? { ...prev, ...updated } : prev)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/bff/tasks/${id}`, { method: "DELETE" })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const handleSave = async (id: string, data: Partial<Task>) => {
    const res = await fetch(`/api/bff/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updated } : t))
      setSelectedTask((prev) => prev?.id === id ? { ...prev, ...updated } : prev)
    }
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
    todo:        "bg-gray-50 border-gray-200",
    in_progress: "bg-blue-50 border-blue-200",
    done:        "bg-green-50 border-green-200",
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
              className={cn("p-1.5 rounded-lg transition-colors",
                view === "kanban" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-lg transition-colors",
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
                    <Input className="rounded-field" placeholder="Task title"
                      value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea className="rounded-field resize-none" rows={3} placeholder="Describe the task..."
                      value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
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
                      <Input className="rounded-field" type="number" min="0"
                        value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Deadline</Label>
                    <Input className="rounded-field" type="date"
                      value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Assign to</Label>
                    <Select value={form.assignedTo} onValueChange={(v) => setForm((f) => ({ ...f, assignedTo: v }))}>
                      <SelectTrigger className="rounded-field"><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{displayName(m)}</SelectItem>
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
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        members={members}
        projects={projects}
        canManage={canManage}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedTask(null) }}
        onStatusChange={handleStatusChange}
        onComplete={handleComplete}
        onDelete={handleDelete}
        onSave={handleSave}
      />

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
              <div key={col.id} className={cn("rounded-xl border p-4 space-y-3 min-h-[200px]", statusColumnColors[col.id])}>
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
                    <TaskCard key={task.id} task={task} onOpen={openTask} />
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
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const timeline = getTimelineInfo(task.deadline)
                  const priorityCfg = PRIORITY_CONFIG[task.priority]
                  return (
                    <tr
                      key={task.id}
                      onClick={() => openTask(task)}
                      className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className={cn("font-medium", task.status === "done" && "line-through text-gray-400")}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</div>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <Badge variant="outline" className={cn("text-xs border pointer-events-none", priorityCfg.color)}>
                          {priorityCfg.label}
                        </Badge>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <Badge variant="outline" className={cn("text-xs capitalize pointer-events-none",
                          task.status === "done" ? "bg-green-100 text-green-800 border-green-200" :
                          task.status === "in_progress" ? "bg-blue-100 text-blue-800 border-blue-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"
                        )}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-gray-500 text-xs">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3">
                        {timeline && task.status !== "done" ? (
                          <Badge variant="outline" className={cn("text-xs border pointer-events-none", timeline.color)}>
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
                                {initials(task.assignee)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">{displayName(task.assignee)}</span>
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
