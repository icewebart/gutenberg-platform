"use client"

import type React from "react"
import { useMemo, useState } from "react"
import type { User as Volunteer, ActivityLog } from "@/types/organization"
import { mockCourses } from "@/data/courses-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, BookOpen, Briefcase, Star, Mail, Phone, MapPin, Calendar, Network, Edit } from "lucide-react"
import { EditVolunteerModal } from "./edit-volunteer-modal"
import { AddActivityModal } from "./add-activity-modal"
import { EditActivityModal } from "./edit-activity-modal"
import { AddProjectModal } from "./add-project-modal"
import { AddPointsModal } from "./add-points-modal"

const SocialLink = ({ href, icon, name }: { href?: string; icon: React.ReactNode; name: string }) => {
  if (!href) return null
  return (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${name} profile`}
      className="text-muted-foreground hover:text-primary transition-colors"
    >
      {icon}
    </a>
  )
}

const socialIcons = {
  linkedin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect width="4" height="12" x="2" y="9"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  facebook: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  instagram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
  ),
  tiktok: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
}

interface VolunteerDetailPageProps {
  volunteer: Volunteer
  onUpdate: (volunteer: Volunteer) => void
}

export function VolunteerDetailPage({ volunteer, onUpdate }: VolunteerDetailPageProps) {
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isAddActivityModalOpen, setAddActivityModalOpen] = useState(false)
  const [isEditActivityModalOpen, setEditActivityModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null)
  const [isAddProjectModalOpen, setAddProjectModalOpen] = useState(false)
  const [isAddPointsModalOpen, setAddPointsModalOpen] = useState(false)

  const sortedActivityLog = useMemo(
    () => [...volunteer.activityLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [volunteer.activityLog],
  )

  const handleUpdate = (updatedVolunteer: Volunteer) => {
    onUpdate(updatedVolunteer)
    setEditModalOpen(false)
  }

  const handleAddActivity = (newActivity: Omit<ActivityLog, "id">) => {
    const updatedVolunteer = {
      ...volunteer,
      activityLog: [...volunteer.activityLog, { ...newActivity, id: `act-${Date.now()}` }],
      gamification: {
        ...volunteer.gamification,
        points: volunteer.gamification.points + newActivity.points,
      },
      pointsHistory: [
        ...volunteer.pointsHistory,
        {
          id: `ph-${Date.now()}`,
          date: newActivity.date,
          reason: newActivity.title,
          points: newActivity.points,
          type: "earned",
        },
      ],
    }
    onUpdate(updatedVolunteer)
    setAddActivityModalOpen(false)
  }

  const handleEditActivity = (updatedActivity: ActivityLog) => {
    const originalActivity = volunteer.activityLog.find((a) => a.id === updatedActivity.id)
    const pointsDifference = updatedActivity.points - (originalActivity?.points || 0)

    const updatedVolunteer = {
      ...volunteer,
      activityLog: volunteer.activityLog.map((a) => (a.id === updatedActivity.id ? updatedActivity : a)),
      gamification: {
        ...volunteer.gamification,
        points: volunteer.gamification.points + pointsDifference,
      },
    }
    onUpdate(updatedVolunteer)
    setEditActivityModalOpen(false)
    setSelectedActivity(null)
  }

  const openEditActivityModal = (activity: ActivityLog) => {
    setSelectedActivity(activity)
    setEditActivityModalOpen(true)
  }

  const enrolledCourses = mockCourses.filter((c) => volunteer.enrolledCourses.includes(c.id))

  return (
    <>
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg shrink-0">
              <AvatarImage src={volunteer.avatar || "/placeholder.svg"} alt={volunteer.name} />
              <AvatarFallback className="text-4xl">
                {volunteer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h1 className="text-3xl font-bold">{volunteer.name}</h1>
                <Badge
                  variant={volunteer.isActive ? "secondary" : "outline"}
                  className={volunteer.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {volunteer.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="default">{volunteer.role}</Badge>
                <Badge variant="outline">{volunteer.department}</Badge>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <SocialLink
                  href={volunteer.profile.socialLinks?.linkedin}
                  icon={socialIcons.linkedin}
                  name="LinkedIn"
                />
                <SocialLink
                  href={volunteer.profile.socialLinks?.facebook}
                  icon={socialIcons.facebook}
                  name="Facebook"
                />
                <SocialLink
                  href={volunteer.profile.socialLinks?.instagram}
                  icon={socialIcons.instagram}
                  name="Instagram"
                />
                <SocialLink href={volunteer.profile.socialLinks?.tiktok} icon={socialIcons.tiktok} name="TikTok" />
              </div>
              <p className="text-muted-foreground pt-2">{volunteer.profile.bio}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{volunteer.email}</span>
                </div>
                {volunteer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{volunteer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{volunteer.profile.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {new Date(volunteer.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  <span>Netzwerk Member: {volunteer.profile.wasMemberInNetzwerk ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 shrink-0">
              <Button>Contact</Button>
              <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Briefcase className="w-4 h-4 mr-2" />
              Projects Timeline
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="points">
              <Star className="w-4 h-4 mr-2" />
              Points
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Activity Log</CardTitle>
                <Button variant="outline" onClick={() => setAddActivityModalOpen(true)}>
                  Add Activity
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Project Type</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedActivityLog.length > 0 ? (
                      sortedActivityLog.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="font-medium">{log.title}</div>
                            <div className="text-sm text-muted-foreground">{log.description}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.projectType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{log.roleInProject}</Badge>
                          </TableCell>
                          <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">+{log.points}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditActivityModal(log)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No activity recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedActivityLog.length > 0 ? (
                  <div className="relative pl-6">
                    <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />
                    <div className="space-y-8">
                      {sortedActivityLog.map((log) => (
                        <div key={log.id} className="relative">
                          <div className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-primary" />
                          <div className="pl-6">
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <h4 className="font-semibold mt-1">{log.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">{log.projectType}</Badge>
                              <Badge variant="secondary">{log.roleInProject}</Badge>
                              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                                +{log.points} Points
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No project activities to display.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="mt-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  {enrolledCourses.length > 0 ? (
                    <ul className="space-y-2">
                      {enrolledCourses.map((course) => (
                        <li key={course.id} className="flex justify-between items-center p-2 rounded-md border">
                          <span>{course.title}</span>
                          <Badge variant="outline">{course.category}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Not enrolled in any courses.</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completed Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Date Completed</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volunteer.watchedCourses?.length > 0 ? (
                        volunteer.watchedCourses.map((course) => (
                          <TableRow key={course.courseId}>
                            <TableCell>{course.courseTitle}</TableCell>
                            <TableCell>{new Date(course.completedDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right text-green-600 font-medium">
                              +{course.pointsEarned}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8">
                            No courses completed.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="points" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Points History</CardTitle>
                <Button variant="outline" onClick={() => setAddPointsModalOpen(true)}>
                  Add Points
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-center">
                  <p className="text-lg text-muted-foreground">Total Points</p>
                  <p className="text-4xl font-bold">{volunteer.gamification.points.toLocaleString()}</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteer.pointsHistory?.length > 0 ? (
                      volunteer.pointsHistory.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                          <TableCell>{p.reason}</TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              p.type === "earned" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {p.type === "earned" ? `+${p.points}` : `-${p.points}`}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          No points history.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <EditVolunteerModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        volunteer={volunteer}
        onSave={handleUpdate}
      />
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setAddActivityModalOpen(false)}
        onAdd={handleAddActivity}
      />
      {selectedActivity && (
        <EditActivityModal
          isOpen={isEditActivityModalOpen}
          onClose={() => setEditActivityModalOpen(false)}
          activity={selectedActivity}
          onSave={handleEditActivity}
        />
      )}
      <AddProjectModal isOpen={isAddProjectModalOpen} onClose={() => setAddProjectModalOpen(false)} />
      <AddPointsModal isOpen={isAddPointsModalOpen} onClose={() => setAddPointsModalOpen(false)} />
    </>
  )
}
