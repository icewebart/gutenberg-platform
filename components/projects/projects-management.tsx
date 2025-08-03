"use client"

import { useState, useMemo } from "react"
import { Plus, Download, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useAuth } from "../auth-context"
import { useMultiTenant } from "../multi-tenant-context"
import { ProjectFilters } from "./project-filters"
import { ProjectCard } from "./project-card"
import { ProjectDetailModal } from "./project-detail-modal"
import { CreateProjectModal } from "./create-project-modal"
import { AssignVolunteersModal } from "./assign-volunteers-modal"
import { mockProjects } from "@/data/projects-data"
import type { Project } from "@/types/organization"

export function ProjectsManagement() {
  const { user, hasPermission, hasRole } = useAuth()
  const { currentOrganization, netzwerkCities } = useMultiTenant()

  // State for projects data
  const [projects, setProjects] = useState<Project[]>(mockProjects)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [netzwerkFilter, setNetzwerkFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Modal states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Filter projects based on user role and organization
  const filteredProjects = useMemo(() => {
    let projectsToShow = projects.filter((p) => p.organizationId === currentOrganization.id)

    // Role-based filtering
    if (user.role === "participant") {
      // Participants only see projects they're assigned to
      projectsToShow = projectsToShow.filter((p) => p.participants.includes(user.id))
    } else if (user.role === "volunteer") {
      // Volunteers see all projects in their organization/netzwerk
      if (user.netzwerkCityId) {
        projectsToShow = projectsToShow.filter((p) => !p.netzwerkCityId || p.netzwerkCityId === user.netzwerkCityId)
      }
    }

    // Apply filters
    return projectsToShow.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesType = typeFilter === "all" || project.type === typeFilter
      const matchesLocation = !locationFilter || project.location.toLowerCase().includes(locationFilter.toLowerCase())

      const matchesNetzwerk =
        netzwerkFilter === "all" ||
        (netzwerkFilter === "main" && !project.netzwerkCityId) ||
        project.netzwerkCityId === netzwerkFilter

      const matchesDateRange = !dateRange.from || new Date(project.startDate) >= dateRange.from

      return matchesSearch && matchesStatus && matchesType && matchesLocation && matchesNetzwerk && matchesDateRange
    })
  }, [
    projects,
    currentOrganization.id,
    user,
    searchQuery,
    statusFilter,
    typeFilter,
    locationFilter,
    netzwerkFilter,
    dateRange,
  ])

  // Project statistics
  const projectStats = useMemo(() => {
    const userProjects = projects.filter((p) => p.organizationId === currentOrganization.id)
    return {
      total: userProjects.length,
      upcoming: userProjects.filter((p) => p.status === "upcoming").length,
      ongoing: userProjects.filter((p) => p.status === "ongoing").length,
      completed: userProjects.filter((p) => p.status === "completed").length,
      myProjects: userProjects.filter((p) => p.participants.includes(user.id) || p.volunteers.includes(user.id)).length,
    }
  }, [projects, currentOrganization.id, user.id])

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...projectData,
    } as Project

    setProjects((prev) => [...prev, newProject])
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowCreateModal(true)
  }

  const handleUpdateProject = (projectData: Partial<Project>) => {
    if (!editingProject) return

    setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? { ...p, ...projectData } : p)))
    setEditingProject(null)
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    }
  }

  const handleJoinProject = (projectId: string) => {
    if (!user) return

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              participants: [...p.participants, user.id],
              currentParticipants: p.currentParticipants + 1,
            }
          : p,
      ),
    )
  }

  const handleAssignVolunteers = (projectId: string, volunteerIds: string[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, volunteers: [...p.volunteers, ...volunteerIds] } : p)),
    )
  }

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setShowDetailModal(true)
  }

  const handleAssignVolunteersModal = (project: Project) => {
    setSelectedProject(project)
    setShowAssignModal(true)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
    setLocationFilter("")
    setNetzwerkFilter("all")
    setDateRange({})
  }

  const getPageTitle = () => {
    switch (user.role) {
      case "participant":
        return "My Projects"
      case "volunteer":
        return "Available Projects"
      case "board_member":
        return "Project Management"
      case "admin":
        return "All Projects"
      default:
        return "Projects"
    }
  }

  const getPageDescription = () => {
    switch (user.role) {
      case "participant":
        return "View and track your assigned projects and activities"
      case "volunteer":
        return "Discover and join projects in your organization"
      case "board_member":
        return "Create, manage, and assign volunteers to projects"
      case "admin":
        return "Oversee all projects across the organization"
      default:
        return "Manage projects and activities"
    }
  }

  if (!user || !currentOrganization) return null

  // Count active filters
  const activeFiltersCount = [
    statusFilter !== "all",
    typeFilter !== "all",
    locationFilter !== "",
    netzwerkFilter !== "all",
    dateRange.from,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600">{getPageDescription()}</p>
        </div>
        <div className="flex gap-2">
          {(hasPermission("create_projects") || hasPermission("*")) && (
            <Button onClick={() => setShowCreateModal(true)} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          )}
          {hasRole(["board_member", "admin"]) && (
            <>
              <Button variant="outline" className="rounded-xl bg-transparent">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" className="rounded-xl bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.total}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{projectStats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Starting soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{projectStats.ongoing}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{projectStats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Involvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{projectStats.myProjects}</div>
            <p className="text-xs text-muted-foreground">Projects I'm part of</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ProjectFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        netzwerkFilter={netzwerkFilter}
        onNetzwerkChange={setNetzwerkFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={hasPermission("manage_projects") ? handleEditProject : undefined}
            onDelete={hasPermission("manage_projects") ? handleDeleteProject : undefined}
            onAssignVolunteers={hasPermission("assign_volunteers") ? handleAssignVolunteersModal : undefined}
            onViewDetails={handleViewDetails}
            onJoinProject={hasPermission("join_projects") ? handleJoinProject : undefined}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || activeFiltersCount > 0
                  ? "Try adjusting your filters to see more projects."
                  : "No projects are available at the moment."}
              </p>
              {(hasPermission("create_projects") || hasPermission("*")) && (
                <Button onClick={() => setShowCreateModal(true)} className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedProject(null)
        }}
        onJoinProject={handleJoinProject}
        onAssignVolunteers={handleAssignVolunteersModal}
      />

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingProject(null)
        }}
        onCreateProject={editingProject ? handleUpdateProject : handleCreateProject}
        editingProject={editingProject}
      />

      <AssignVolunteersModal
        project={selectedProject}
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false)
          setSelectedProject(null)
        }}
        onAssignVolunteers={handleAssignVolunteers}
      />
    </div>
  )
}
