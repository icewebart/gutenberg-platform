"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Calendar, Euro } from "lucide-react"

interface FormField {
  id: string
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox"
  label: string
  required: boolean
  options: string[]
}

interface PublicProject {
  id: string
  title: string
  shortDescription: string
  imageUrl?: string
  startDate?: string
  endDate?: string
  location: string
  projectType: string
  applicationFee: number
  formFields: FormField[]
  registrationEnabled: boolean
  autoApprove: boolean
  organizationId: string
}

function formatDate(d?: string) {
  if (!d) return null
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatFee(cents: number) {
  return (cents / 100).toFixed(2)
}

export default function ApplyPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()

  const [project, setProject] = useState<PublicProject | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [projectError, setProjectError] = useState("")

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [customFields, setCustomFields] = useState<Record<string, string | boolean>>({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/bff/projects/${projectId}/public`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setProjectError(data.error)
        } else {
          setProject(data)
          // Initialize custom fields
          const init: Record<string, string | boolean> = {}
          for (const field of data.formFields ?? []) {
            init[field.id] = field.type === "checkbox" ? false : ""
          }
          setCustomFields(init)
        }
      })
      .catch(() => setProjectError("Failed to load project"))
      .finally(() => setLoadingProject(false))
  }, [projectId])

  const handleCustomField = (id: string, value: string | boolean) => {
    setCustomFields((prev) => ({ ...prev, [id]: value }))
  }

  const validate = () => {
    if (!firstName.trim()) return "First name is required"
    if (!lastName.trim()) return "Last name is required"
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email is required"
    for (const field of project?.formFields ?? []) {
      if (field.required) {
        const val = customFields[field.id]
        if (field.type === "checkbox" && !val) return `"${field.label}" is required`
        if (field.type !== "checkbox" && !val) return `"${field.label}" is required`
      }
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/bff/projects/${projectId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          formData: customFields,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to submit application")
        return
      }

      if (data.checkoutUrl) {
        // Stripe redirect
        window.location.href = data.checkoutUrl
      } else if (data.success) {
        // Free project — store credentials and redirect to success
        sessionStorage.setItem(
          `apply_result_${projectId}`,
          JSON.stringify({ email: data.email, tempPassword: data.tempPassword, status: data.status })
        )
        router.push(`/apply/${projectId}/success`)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 rounded-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-red-600 font-medium">{projectError || "Project not found"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project.registrationEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 rounded-2xl">
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <p className="text-lg font-semibold text-gray-800">Registration is closed</p>
            <p className="text-sm text-gray-500">Registration is not open for this project at this time.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dateRange = (() => {
    const s = formatDate(project.startDate)
    const e = formatDate(project.endDate)
    if (s && e) return `${s} – ${e}`
    if (s) return `From ${s}`
    if (e) return `Until ${e}`
    return null
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-base font-bold text-purple-700 tracking-tight">Gutenberg Platform</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Project card */}
        <Card className="rounded-2xl overflow-hidden border-gray-200 shadow-sm">
          {project.imageUrl && (
            <div className="h-48 overflow-hidden">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!project.imageUrl && (
            <div className="h-24 bg-gradient-to-br from-violet-500 to-purple-700" />
          )}
          <CardContent className="pt-4 pb-5">
            <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{project.shortDescription}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              {dateRange && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {dateRange}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {project.location}
              </div>
              {project.applicationFee > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                  <Euro className="h-3.5 w-3.5" />
                  Registration fee: €{formatFee(project.applicationFee)}
                </div>
              )}
              {project.applicationFee === 0 && (
                <Badge className="bg-green-50 text-green-700 border-green-200 border text-xs">
                  Free
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application form */}
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Apply to this project</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Fill in your details to register. An account will be created for you automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Standard fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Ana"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Popescu"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ana@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+40 7xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>

            {/* Custom fields */}
            {project.formFields.map((field) => (
              <div key={field.id}>
                {field.type === "text" && (
                  <div>
                    <Label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      placeholder={field.label}
                      value={(customFields[field.id] as string) || ""}
                      onChange={(e) => handleCustomField(field.id, e.target.value)}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                )}
                {field.type === "email" && (
                  <div>
                    <Label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      type="email"
                      placeholder={field.label}
                      value={(customFields[field.id] as string) || ""}
                      onChange={(e) => handleCustomField(field.id, e.target.value)}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                )}
                {field.type === "phone" && (
                  <div>
                    <Label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      type="tel"
                      placeholder={field.label}
                      value={(customFields[field.id] as string) || ""}
                      onChange={(e) => handleCustomField(field.id, e.target.value)}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                )}
                {field.type === "textarea" && (
                  <div>
                    <Label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Textarea
                      placeholder={field.label}
                      value={(customFields[field.id] as string) || ""}
                      onChange={(e) => handleCustomField(field.id, e.target.value)}
                      rows={3}
                      className="mt-1 rounded-xl resize-none"
                    />
                  </div>
                )}
                {field.type === "select" && (
                  <div>
                    <Label className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                      value={(customFields[field.id] as string) || ""}
                      onValueChange={(v) => handleCustomField(field.id, v)}
                    >
                      <SelectTrigger className="mt-1 rounded-xl">
                        <SelectValue placeholder={`Select ${field.label}…`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {field.type === "checkbox" && (
                  <div className="flex items-start gap-3 py-1">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={(customFields[field.id] as boolean) || false}
                      onCheckedChange={(checked) => handleCustomField(field.id, !!checked)}
                      className="mt-0.5"
                    />
                    <Label htmlFor={`field-${field.id}`} className="text-sm leading-snug cursor-pointer">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                )}
              </div>
            ))}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Fee summary */}
            {project.applicationFee > 0 && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                <span className="text-emerald-700 font-medium">Registration fee</span>
                <span className="text-emerald-800 font-bold">€{formatFee(project.applicationFee)}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl gap-2 bg-purple-600 hover:bg-purple-700 text-white py-5"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? "Submitting…"
                : project.applicationFee > 0
                ? `Pay €${formatFee(project.applicationFee)} and Register`
                : "Submit Application"}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              By submitting, an account will be created for you on the Gutenberg Platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
