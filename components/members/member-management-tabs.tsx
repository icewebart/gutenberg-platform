"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SendInviteForm } from "./send-invite-form"
import { CreateMemberForm } from "./create-member-form"
import { InvitationsList } from "./invitations-list"
import { Mail, UserPlus, List } from "lucide-react"

export function MemberManagementTabs() {
  return (
    <Tabs defaultValue="invite" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="invite" className="gap-2">
          <Mail className="h-4 w-4" />
          Send Invite
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Create Manually
        </TabsTrigger>
        <TabsTrigger value="pending" className="gap-2">
          <List className="h-4 w-4" />
          Pending Invites
        </TabsTrigger>
      </TabsList>

      <TabsContent value="invite" className="mt-6">
        <SendInviteForm />
      </TabsContent>

      <TabsContent value="manual" className="mt-6">
        <CreateMemberForm />
      </TabsContent>

      <TabsContent value="pending" className="mt-6">
        <InvitationsList />
      </TabsContent>
    </Tabs>
  )
}
