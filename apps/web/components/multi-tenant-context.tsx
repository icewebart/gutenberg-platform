"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

interface Organization {
  id: string
  name: string
  domain: string
  settings: { allowRegistration: boolean; requireApproval: boolean; defaultRole: string }
  createdAt: string
  updatedAt: string
}

interface NetzwerkCity {
  id: string
  name: string
  country: string
  organizationId: string
  coordinators: string[]
  createdAt: string
}

interface MultiTenantContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  netzwerkCities: NetzwerkCity[]
  switchOrganization: (organizationId: string) => void
  loading: boolean
}

const MultiTenantContext = createContext<MultiTenantContextType | undefined>(undefined)

export function MultiTenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [netzwerkCities, setNetzwerkCities] = useState<NetzwerkCity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    const loadData = async () => {
      try {
        const res = await fetch("/api/bff/organizations")
        if (!res.ok) return
        const orgs: Organization[] = await res.json()
        setOrganizations(orgs)

        // Default to the user's own org, fall back to first
        const userOrg = orgs.find((o) => o.id === user.organizationId) ?? orgs[0] ?? null
        setCurrentOrganization(userOrg)

        // Load cities for the current org
        if (userOrg) {
          const citiesRes = await fetch(`/api/bff/organizations/${userOrg.id}/cities`)
          if (citiesRes.ok) setNetzwerkCities(await citiesRes.json())
        }
      } catch (err) {
        console.error("Failed to load organization data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const switchOrganization = async (organizationId: string) => {
    const org = organizations.find((o) => o.id === organizationId)
    if (!org) return
    setCurrentOrganization(org)

    // Reload cities for the newly selected org
    try {
      const citiesRes = await fetch(`/api/bff/organizations/${org.id}/cities`)
      if (citiesRes.ok) setNetzwerkCities(await citiesRes.json())
    } catch {}
  }

  return (
    <MultiTenantContext.Provider value={{ currentOrganization, organizations, netzwerkCities, switchOrganization, loading }}>
      {children}
    </MultiTenantContext.Provider>
  )
}

export function useMultiTenant() {
  const context = useContext(MultiTenantContext)
  if (context === undefined) throw new Error("useMultiTenant must be used within a MultiTenantProvider")
  return context
}
