"use client"

export const runtime = "edge"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
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
  MessageSquare,
  Send,
  Tag,
  CheckSquare,
  Square,
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvatarGradient } from "@/lib/avatar-gradient"
import Link from "next/link"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useDroppable } from "@dnd-kit/core"

// ─── Types ─────────────────────────────────────────────────────────────────────

type Priority = "low" | "medium" | "high" | "urgent"
type Status = "todo" | "in_progress" | "done"

interface Subtask {
  id: string
  title: string
  done: boolean
}

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
  labels: string[]
  subtasks: Subtask[]
  completedAt?: string | null
  pointsAwarded: boolean
  createdAt: string
  updatedAt: string
}

interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  user: { id: string; name: string; firstName?: string; lastName?: string; avatar?: string } | null
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

// ─── Config ────────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  low:    { label: "Low",    color: "text-green-600 bg-green-50 border-green-200",   dot: "bg-green-500" },
  medium: { label: "Medium", color: "text-yellow-600 bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" },
  high:   { label: "High",   color: "text-red-600 bg-red-50 border-red-200",         dot: "bg-red-500" },
  urgent: { label: "Urgent", color: "text-purple-600 bg-purple-50 border-purple-200", dot: "bg-purple-600" },
}

const STATUS_COLUMNS: { id: Status; label: string; icon: typeof Circle; headerColor: string }[] = [
  { id: "todo",        label: "To Do",       icon: Circle,       headerColor: "border-t-gray-400" },
  { id: "in_progress", label: "In Progress", icon: AlertCircle,  headerColor: "border-t-blue-500" },
  { id: "done",        label: "Done",        icon: CheckCircle2, headerColor: "border-t-green-500" },
]

const STATUS_STYLES: Record<Status, string> = {
  todo:        "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  done:        "bg-green-50 text-green-700 border-green-200",
}

const LABEL_COLORS = [
  "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-yellow-100 text-yellow-700",
  "bg-red-100 text-red-700", "bg-purple-100 text-purple-700", "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700", "bg-orange-100 text-orange-700",
]

const PRESET_LABELS = ["Bug", "Feature", "Design", "Research", "Review", "Urgent", "Backend", "Frontend"]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function displayName(m: Member | Assignee) {
  if ((m as Member).firstName || (m as Member).lastName)
    return `${(m as Member).firstName ?? ""} ${(m as Member).lastName ?? ""}`.trim()
  return m.name
}

function initials(m: Member | Assignee) {
  const n = displayName(m)
  const parts = n.split(" ")
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : n.slice(0, 2).toUpperCase()
}

function getTimelineInfo(deadline?: string | null): { label: string; color: string } | null {
  if (!deadline) return null
  const diffDays = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (diffDays < 0)  return { label: `${Math.abs(diffDays)}d overdue`, color: "text-red-600 bg-red-50 border-red-200" }
  if (diffDays === 0) return { label: "Due today",    color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
  if (diffDays === 1) return { label: "Due tomorrow", color: "text-yellow-600 bg-yellow-50 border-yellow-200" }
  return { label: `${diffDays}d left`, color: "text-green-600 bg-green-50 border-green-200" }
}

function getLabelColor(label: string) {
  let hash = 0
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash)
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length]
}

// ─── Subtasks Checklist ────────────────────────────────────────────────────────

function SubtaskChecklist({
  subtasks,
  onToggle,
  onAdd,
  onDelete,
  canManage,
}: {
  subtasks: Subtask[]
  onToggle: (id: string) => void
  onAdd: (title: string) => void
  onDelete: (id: string) => void
  canManage: boolean
}) {
  const [newTitle, setNewTitle] = useState("")

  const handleAdd = () => {
    if (!newTitle.trim()) return
    onAdd(newTitle.trim())
    setNewTitle("")
  }

  const done = subtasks.filter((s) => s.done).length
  const total = subtasks.length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <CheckSquare className="h-4 w-4" />
          Subtasks
        </span>
        {total > 0 && (
          <span className="text-xs text-gray-500">{done}/{total} done</span>
        )}
      </div>
      {total > 0 && (
        <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      )}
      <div className="space-y-1">
        {subtasks.map((st) => (
          <div key={st.id} className="flex items-center gap-2 group">
            <button onClick={() => onToggle(st.id)} className="shrink-0 text-gray-400 hover:text-green-600 transition-colors">
              {st.done ? <CheckSquare className="h-4 w-4 text-green-600" /> : <Square className="h-4 w-4" />}
            </button>
            <span className={cn("flex-1 text-sm", st.done && "line-through text-gray-400")}>{st.title}</span>
            {canManage && (
              <button
                onClick={() => onDelete(st.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {canManage && (
        <div className="flex gap-2">
          <Input
            placeholder="Add a subtask..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-8 text-sm rounded-lg"
          />
          <Button size="sm" variant="outline" onClick={handleAdd} className="h-8 px-2 rounded-lg">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Comments Section ──────────────────────────────────────────────────────────

function CommentsSection({
  taskId,
  currentUserId,
  canManage,
}: {
  taskId: string
  currentUserId: string
  canManage: boolean
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [posting, setPosting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/bff/tasks/${taskId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }, [taskId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [comments])

  const postComment = async () => {
    if (!newComment.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch(`/api/bff/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (res.ok) {
        const c = await res.json()
        setComments((prev) => [...prev, c])
        setNewComment("")
      }
    } finally {
      setPosting(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/bff/tasks/${taskId}/comments/${commentId}`, { method: "DELETE" })
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const commentDisplayName = (c: Comment) => {
    if (!c.user) return "Unknown"
    if (c.user.firstName || c.user.lastName)
      return `${c.user.firstName ?? ""} ${c.user.lastName ?? ""}`.trim()
    return c.user.name
  }

  const commentInitials = (c: Comment) => {
    const n = commentDisplayName(c)
    const parts = n.split(" ")
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : n.slice(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        Comments {comments.length > 0 && <span className="text-gray-400">({comments.length})</span>}
      </span>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 group">
              <Avatar className="h-7 w-7 shrink-0">
                {c.user?.avatar ? (
                  <AvatarImage src={c.user.avatar} />
                ) : (
                  <AvatarFallback className={cn("text-[10px] text-white", getAvatarGradient(c.user?.name ?? "?"))}>
                    {commentInitials(c)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-800">{commentDisplayName(c)}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {(c.userId === currentUserId || canManage) && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all ml-auto"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && postComment()}
          className="h-8 text-sm rounded-lg flex-1"
        />
        <Button size="sm" onClick={postComment} disabled={posting || !newComment.trim()} className="h-8 px-2 rounded-lg">
          {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  )
}

// ─── Labels Picker ─────────────────────────────────────────────────────────────

function LabelsPicker({ labels, onChange }: { labels: string[]; onChange: (labels: string[]) => void }) {
  const [custom, setCustom] = useState("")

  const toggle = (label: string) => {
    if (labels.includes(label)) onChange(labels.filter((l) => l !== label))
    else onChange([...labels, label])
  }

  const addCustom = () => {
    const trimmed = custom.trim()
    if (!trimmed || labels.includes(trimmed)) return
    onChange([...labels, trimmed])
    setCustom("")
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {PRESET_LABELS.map((l) => (
          <button
            key={l}
            onClick={() => toggle(l)}
            className={cn(
              "px-2 py-0.5 rounded-full text-xs border transition-all",
              labels.includes(l) ? getLabelColor(l) + " border-transparent font-medium" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Custom label..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          className="h-7 text-xs rounded-lg"
        />
        <Button size="sm" variant="outline" onClick={addCustom} className="h-7 px-2 rounded-lg text-xs">Add</Button>
      </div>
    </div>
  )
}

// ─── Task Detail Modal ─────────────────────────────────────────────────────────

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
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPriority, setEditPriority] = useState<Priority>("medium")
  const [editStatus, setEditStatus] = useState<Status>("todo")
  const [editDeadline, setEditDeadline] = useState("")
  const [editPoints, setEditPoints] = useState("0")
  const [editAssignedTo, setEditAssignedTo] = useState("")
  const [editProjectId, setEditProjectId] = useState("")
  const [editLabels, setEditLabels] = useState<string[]>([])
  const [editSubtasks, setEditSubtasks] = useState<Subtask[]>([])

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
    setEditLabels(task.labels ?? [])
    setEditSubtasks(task.subtasks ?? [])
    setEditing(false)
    setConfirmDelete(false)
  }, [task])

  if (!task) return null

  const timeline = getTimelineInfo(task.deadline)
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const linkedProject = projects.find((p) => p.id === task.projectId)
  const assigneeMember = members.find((m) => m.id === task.assignedTo) ?? task.assignee
  const createdDate = new Date(task.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
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
      labels: editLabels,
      subtasks: editSubtasks,
    })
    setSaving(false)
    setEditing(false)
  }

  const handleSubtaskToggle = async (subtaskId: string) => {
    const updated = (task.subtasks ?? []).map((s) => s.id === subtaskId ? { ...s, done: !s.done } : s)
    await onSave(task.id, { subtasks: updated })
  }

  const handleSubtaskAdd = async (title: string) => {
    const newSt: Subtask = { id: crypto.randomUUID(), title, done: false }
    const updated = [...(task.subtasks ?? []), newSt]
    await onSave(task.id, { subtasks: updated })
  }

  const handleSubtaskDelete = async (subtaskId: string) => {
    const updated = (task.subtasks ?? []).filter((s) => s.id !== subtaskId)
    await onSave(task.id, { subtasks: updated })
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
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            )}
            <button onClick={() => { onClose(); setEditing(false) }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
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
                  <SelectTrigger className="w-36 rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Priority)}>
                  <SelectTrigger className="w-32 rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="urgent">🟣 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Badge variant="outline" className={cn("text-xs border", STATUS_STYLES[task.status])}>
                  {STATUS_COLUMNS.find((c) => c.id === task.status)?.label ?? task.status}
                </Badge>
                <Badge variant="outline" className={cn("text-xs border", priorityCfg.color)}>
                  <Flag className="h-3 w-3 mr-1" />
                  {priorityCfg.label}
                </Badge>
                {timeline && (
                  <Badge variant="outline" className={cn("text-xs border", timeline.color)}>
                    <Clock className="h-3 w-3 mr-1" />
                    {timeline.label}
                  </Badge>
                )}
                {task.points > 0 && (
                  <Badge variant="outline" className="text-xs border text-yellow-600 bg-yellow-50 border-yellow-200">
                    <Award className="h-3 w-3 mr-1" />
                    {task.points} pts{task.pointsAwarded && " ✓"}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><Tag className="h-3 w-3" /> Labels</span>
            {editing ? (
              <LabelsPicker labels={editLabels} onChange={setEditLabels} />
            ) : (
              <div className="flex flex-wrap gap-1">
                {(task.labels ?? []).length === 0 ? (
                  <span className="text-xs text-gray-400">No labels</span>
                ) : (
                  (task.labels ?? []).map((l) => (
                    <span key={l} className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getLabelColor(l))}>{l}</span>
                  ))
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Meta fields */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Assignee */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 flex items-center gap-1"><User className="h-3 w-3" /> Assignee</Label>
              {editing ? (
                <Select value={editAssignedTo} onValueChange={setEditAssignedTo}>
                  <SelectTrigger className="rounded-xl h-8 text-xs"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{displayName(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : assigneeMember ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {assigneeMember.avatar ? (
                      <AvatarImage src={assigneeMember.avatar} />
                    ) : (
                      <AvatarFallback className={cn("text-[10px] text-white", getAvatarGradient(displayName(assigneeMember)))}>
                        {initials(assigneeMember)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm">{displayName(assigneeMember)}</span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Unassigned</span>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Due Date</Label>
              {editing ? (
                <Input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="rounded-xl h-8 text-xs" />
              ) : (
                <span className="text-sm text-gray-700">
                  {task.deadline ? new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </span>
              )}
            </div>

            {/* Project */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 flex items-center gap-1"><FolderOpen className="h-3 w-3" /> Project</Label>
              {editing ? (
                <Select value={editProjectId} onValueChange={setEditProjectId}>
                  <SelectTrigger className="rounded-xl h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : linkedProject ? (
                <Link href="/projects" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <FolderOpen className="h-3 w-3" />
                  {linkedProject.title}
                </Link>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </div>

            {/* Points */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 flex items-center gap-1"><Award className="h-3 w-3" /> Points</Label>
              {editing ? (
                <Input type="number" min="0" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} className="rounded-xl h-8 text-xs" />
              ) : (
                <span className="text-sm text-gray-700">{task.points > 0 ? `${task.points} pts` : "—"}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Description</Label>
            {editing ? (
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="rounded-xl text-sm min-h-[80px]" placeholder="Task description..." />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {task.description || <span className="text-gray-400">No description</span>}
              </p>
            )}
          </div>

          {/* Edit actions */}
          {editing && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Labels</Label>
              <LabelsPicker labels={editLabels} onChange={setEditLabels} />
            </div>
          )}

          <Separator />

          {/* Subtasks */}
          <SubtaskChecklist
            subtasks={task.subtasks ?? []}
            onToggle={handleSubtaskToggle}
            onAdd={handleSubtaskAdd}
            onDelete={handleSubtaskDelete}
            canManage={canManage}
          />

          <Separator />

          {/* Comments */}
          <CommentsSection
            taskId={task.id}
            currentUserId={user?.id ?? ""}
            canManage={canManage}
          />

          <Separator />

          {/* Footer meta */}
          <div className="text-xs text-gray-400 space-y-0.5">
            <p>Created {createdDate}</p>
            {completedDate && <p className="text-green-600">✓ Completed {completedDate}</p>}
          </div>

          {/* Action buttons */}
          {editing ? (
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} disabled={saving} className="rounded-xl flex-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl">Cancel</Button>
            </div>
          ) : (
            <div className="flex gap-2 pt-1 flex-wrap">
              {task.status !== "done" && canManage && (
                <Button onClick={() => onComplete(task.id)} className="rounded-xl bg-green-600 hover:bg-green-700 text-white">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              {task.status !== "done" && canManage && task.status === "todo" && (
                <Button variant="outline" onClick={() => onStatusChange(task.id, "in_progress")} className="rounded-xl">
                  Start Task
                </Button>
              )}
              {canManage && (
                confirmDelete ? (
                  <div className="flex gap-2 items-center ml-auto">
                    <span className="text-xs text-red-600">Sure?</span>
                    <Button variant="destructive" size="sm" onClick={() => { onDelete(task.id); onClose() }} className="rounded-xl h-8">Delete</Button>
                    <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)} className="rounded-xl h-8">Cancel</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sortable Task Card ────────────────────────────────────────────────────────

function SortableTaskCard({ task, members, onClick }: { task: Task; members: Member[]; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }

  return (
    <div ref={setNodeRef} style={style} className={cn("group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer", isDragging && "shadow-lg")}>
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="absolute left-2 top-3 opacity-0 group-hover:opacity-40 hover:!opacity-80 cursor-grab active:cursor-grabbing p-1 rounded touch-none">
        <GripVertical className="h-3 w-3 text-gray-400" />
      </div>
      <div onClick={onClick} className="p-3 pl-7">
        <TaskCardContent task={task} members={members} />
      </div>
    </div>
  )
}

function TaskCardContent({ task, members }: { task: Task; members: Member[] }) {
  const priorityCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium
  const timeline = getTimelineInfo(task.deadline)
  const assigneeMember = members.find((m) => m.id === task.assignedTo) ?? task.assignee
  const labels = Array.isArray(task.labels) ? task.labels : []
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : []
  const subtasksDone = subtasks.filter((s) => s.done).length
  const subtasksTotal = subtasks.length

  return (
    <div className="space-y-2">
      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {labels.slice(0, 3).map((l) => (
            <span key={l} className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium", getLabelColor(l))}>{l}</span>
          ))}
          {labels.length > 3 && <span className="text-[10px] text-gray-400">+{labels.length - 3}</span>}
        </div>
      )}

      {/* Title */}
      <p className={cn("text-sm font-medium leading-snug text-gray-800", task.status === "done" && "line-through text-gray-400")}>
        {task.title}
      </p>

      {/* Priority + timeline */}
      <div className="flex flex-wrap gap-1">
        <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] border flex items-center gap-1", priorityCfg.color)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", priorityCfg.dot)} />
          {priorityCfg.label}
        </span>
        {timeline && (
          <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] border flex items-center gap-1", timeline.color)}>
            <Clock className="h-2.5 w-2.5" />
            {timeline.label}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {assigneeMember && (
            <Avatar className="h-5 w-5">
              {assigneeMember.avatar ? (
                <AvatarImage src={assigneeMember.avatar} />
              ) : (
                <AvatarFallback className={cn("text-[8px] text-white", getAvatarGradient(displayName(assigneeMember)))}>
                  {initials(assigneeMember)}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          {task.points > 0 && (
            <span className="text-[10px] text-yellow-600 flex items-center gap-0.5">
              <Award className="h-2.5 w-2.5" />{task.points}
            </span>
          )}
        </div>
        {subtasksTotal > 0 && (
          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
            <CheckSquare className="h-2.5 w-2.5" />{subtasksDone}/{subtasksTotal}
          </span>
        )}

      </div>
    </div>
  )
}

// ─── Droppable Column ──────────────────────────────────────────────────────────

function DroppableColumn({ column, tasks, members, onTaskClick }: {
  column: typeof STATUS_COLUMNS[number]
  tasks: Task[]
  members: Member[]
  onTaskClick: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const Icon = column.icon

  return (
    <div className={cn("flex flex-col rounded-2xl border-t-4 bg-gray-50/60 min-h-[400px] transition-colors", column.headerColor, isOver && "bg-blue-50/60")}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{column.label}</span>
        </div>
        <span className="text-xs font-medium text-gray-400 bg-white border rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 px-3 pb-3 space-y-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} members={members} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-300">
            <Icon className="h-8 w-8 mb-2" />
            <p className="text-xs">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const { user, hasPermission } = useAuth()
  const { currentOrganization } = useMultiTenant()

  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [myTasksOnly, setMyTasksOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all")
  const [filterLabel, setFilterLabel] = useState("all")

  // Task detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Create task form
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newPriority, setNewPriority] = useState<Priority>("medium")
  const [newStatus, setNewStatus] = useState<Status>("todo")
  const [newDeadline, setNewDeadline] = useState("")
  const [newPoints, setNewPoints] = useState("0")
  const [newAssignedTo, setNewAssignedTo] = useState("")
  const [newProjectId, setNewProjectId] = useState("")
  const [newLabels, setNewLabels] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  // DnD
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const canManage = hasPermission("manage_projects") || hasPermission("*")

  const orgId = currentOrganization?.id

  const fetchTasks = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ organizationId: orgId })
      if (myTasksOnly) params.set("myTasks", "true")
      const res = await fetch(`/api/bff/tasks?${params}`)
      if (res.ok) setTasks(await res.json())
    } finally {
      setLoading(false)
    }
  }, [orgId, myTasksOnly])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  useEffect(() => {
    if (!orgId) return
    fetch(`/api/bff/members?organizationId=${orgId}`).then((r) => r.ok ? r.json() : []).then(setMembers).catch(() => {})
    fetch(`/api/bff/projects?organizationId=${orgId}`).then((r) => r.ok ? r.json() : []).then((data) => setProjects(Array.isArray(data) ? data : data.projects ?? [])).catch(() => {})
  }, [orgId])

  // All unique labels across tasks
  const allLabels = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach((t) => (t.labels ?? []).forEach((l) => set.add(l)))
    return Array.from(set)
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterPriority !== "all" && t.priority !== filterPriority) return false
      if (filterLabel !== "all" && !(t.labels ?? []).includes(filterLabel)) return false
      return true
    })
  }, [tasks, searchQuery, filterPriority, filterLabel])

  const tasksByStatus = useMemo(() => {
    const map: Record<Status, Task[]> = { todo: [], in_progress: [], done: [] }
    filteredTasks.forEach((t) => { if (map[t.status]) map[t.status].push(t) })
    return map
  }, [filteredTasks])

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!newTitle.trim() || !orgId) return
    setCreating(true)
    try {
      const res = await fetch("/api/bff/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          title: newTitle.trim(),
          description: newDescription,
          status: newStatus,
          priority: newPriority,
          deadline: newDeadline || null,
          points: parseInt(newPoints) || 0,
          assignedTo: newAssignedTo || null,
          projectId: newProjectId || null,
          labels: newLabels,
          subtasks: [],
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setTasks((prev) => [created, ...prev])
        setCreateOpen(false)
        setNewTitle(""); setNewDescription(""); setNewPriority("medium"); setNewStatus("todo")
        setNewDeadline(""); setNewPoints("0"); setNewAssignedTo(""); setNewProjectId(""); setNewLabels([])
      }
    } finally {
      setCreating(false)
    }
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
      if (selectedTask?.id === id) setSelectedTask((prev) => prev ? { ...prev, ...updated } : prev)
    }
  }

  const handleStatusChange = async (id: string, status: Status) => {
    await handleSave(id, { status })
  }

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/bff/tasks/${id}/complete`, { method: "PATCH" })
    if (res.ok) {
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updated } : t))
      if (selectedTask?.id === id) setSelectedTask((prev) => prev ? { ...prev, ...updated } : prev)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/bff/tasks/${id}`, { method: "DELETE" })
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setDetailOpen(false)
    setSelectedTask(null)
  }

  // ── Drag and Drop ──────────────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedTask = tasks.find((t) => t.id === active.id)
    if (!draggedTask) return

    // Check if dropped over a column
    const targetStatus = STATUS_COLUMNS.find((c) => c.id === over.id)?.id
    if (targetStatus && draggedTask.status !== targetStatus) {
      await handleStatusChange(String(active.id), targetStatus)
      return
    }

    // Check if dropped over another task → move to that task's column
    const targetTask = tasks.find((t) => t.id === over.id)
    if (targetTask && draggedTask.status !== targetTask.status) {
      await handleStatusChange(String(active.id), targetTask.status)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!user) return null

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView("kanban")}
              className={cn("p-1.5 rounded-lg transition-all", view === "kanban" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-lg transition-all", view === "list" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* My tasks toggle */}
          <Button
            variant={myTasksOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className="rounded-xl h-9"
          >
            <User className="h-3.5 w-3.5 mr-1.5" />
            My Tasks
          </Button>

          {/* New task */}
          {canManage && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-9">
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>Title *</Label>
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title" className="rounded-xl" onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Optional description..." className="rounded-xl min-h-[80px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Status)}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Priority</Label>
                      <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Priority)}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Low</SelectItem>
                          <SelectItem value="medium">🟡 Medium</SelectItem>
                          <SelectItem value="high">🔴 High</SelectItem>
                          <SelectItem value="urgent">🟣 Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Assignee</Label>
                      <Select value={newAssignedTo} onValueChange={setNewAssignedTo}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {members.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{displayName(m)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Due Date</Label>
                      <Input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Project</Label>
                      <Select value={newProjectId} onValueChange={setNewProjectId}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Points</Label>
                      <Input type="number" min="0" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1"><Tag className="h-3 w-3" /> Labels</Label>
                    <LabelsPicker labels={newLabels} onChange={setNewLabels} />
                  </div>
                  <Button onClick={handleCreate} disabled={creating || !newTitle.trim()} className="w-full rounded-xl">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl h-9 w-64"
        />
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | "all")}>
          <SelectTrigger className="rounded-xl h-9 w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">🟢 Low</SelectItem>
            <SelectItem value="medium">🟡 Medium</SelectItem>
            <SelectItem value="high">🔴 High</SelectItem>
            <SelectItem value="urgent">🟣 Urgent</SelectItem>
          </SelectContent>
        </Select>
        {allLabels.length > 0 && (
          <Select value={filterLabel} onValueChange={setFilterLabel}>
            <SelectTrigger className="rounded-xl h-9 w-36"><SelectValue placeholder="Label" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              {allLabels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : view === "kanban" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUS_COLUMNS.map((col) => (
              <DroppableColumn
                key={col.id}
                column={col}
                tasks={tasksByStatus[col.id]}
                members={members}
                onTaskClick={(task) => { setSelectedTask(task); setDetailOpen(true) }}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-3 w-72 rotate-2">
                <TaskCardContent task={activeTask} members={members} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        // List view
        <div className="space-y-2">
          {filteredTasks.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No tasks found</p>
            </div>
          )}
          {filteredTasks.map((task) => {
            const priorityCfg = PRIORITY_CONFIG[task.priority]
            const timeline = getTimelineInfo(task.deadline)
            const assigneeMember = members.find((m) => m.id === task.assignedTo) ?? task.assignee
            return (
              <div
                key={task.id}
                onClick={() => { setSelectedTask(task); setDetailOpen(true) }}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3 hover:shadow-md transition-all cursor-pointer group"
              >
                <span className={cn("w-2 h-2 rounded-full shrink-0", priorityCfg.dot)} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", task.status === "done" && "line-through text-gray-400")}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", STATUS_STYLES[task.status])}>
                      {STATUS_COLUMNS.find((c) => c.id === task.status)?.label}
                    </span>
                    {(task.labels ?? []).slice(0, 2).map((l) => (
                      <span key={l} className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", getLabelColor(l))}>{l}</span>
                    ))}
                    {timeline && <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", timeline.color)}>{timeline.label}</span>}
                  </div>
                </div>
                {(task.subtasks ?? []).length > 0 && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5 shrink-0">
                    <CheckSquare className="h-3 w-3" />
                    {(task.subtasks ?? []).filter((s) => s.done).length}/{(task.subtasks ?? []).length}
                  </span>
                )}
                {assigneeMember && (
                  <Avatar className="h-6 w-6 shrink-0">
                    {assigneeMember.avatar ? (
                      <AvatarImage src={assigneeMember.avatar} />
                    ) : (
                      <AvatarFallback className={cn("text-[9px] text-white", getAvatarGradient(displayName(assigneeMember)))}>
                        {initials(assigneeMember)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
                {task.points > 0 && (
                  <span className="text-[10px] text-yellow-600 flex items-center gap-0.5 shrink-0">
                    <Award className="h-3 w-3" />{task.points}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

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
    </div>
  )
}
