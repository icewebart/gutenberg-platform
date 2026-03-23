"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Building2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { useMultiTenant } from "./multi-tenant-context"
import { useAuth } from "./auth-context"

export function OrganizationSelector() {
  const { currentOrganization, organizations, switchOrganization } = useMultiTenant()
  const { hasRole } = useAuth()
  const [open, setOpen] = useState(false)

  if (!currentOrganization) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between rounded-xl bg-transparent"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm">{currentOrganization.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.id}
                  onSelect={() => {
                    switchOrganization(org.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", currentOrganization.id === org.id ? "opacity-100" : "opacity-0")}
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{org.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {hasRole("admin") && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      // Handle create new organization
                      setOpen(false)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Organization
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
