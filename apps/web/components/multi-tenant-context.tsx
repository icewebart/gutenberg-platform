"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Organization, NetzwerkCity } from "../types/organization"

interface MultiTenantContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  netzwerkCities: NetzwerkCity[]
  switchOrganization: (organizationId: string) => void
  loading: boolean
}

const MultiTenantContext = createContext<MultiTenantContextType | undefined>(undefined)

export function MultiTenantProvider({ children }: { children: React.ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [netzwerkCities, setNetzwerkCities] = useState<NetzwerkCity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading organizations and cities
    const loadData = async () => {
      try {
        // Mock data - in a real app, this would come from an API
        const mockOrganizations: Organization[] = [
          {
            id: "gutenberg",
            name: "Gutenberg Foundation",
            domain: "gutenberg.org",
            settings: {
              allowRegistration: true,
              requireApproval: false,
              defaultRole: "volunteer",
            },
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-03-15T00:00:00Z",
          },
          {
            id: "greentech",
            name: "GreenTech Solutions",
            domain: "greentech.com",
            settings: {
              allowRegistration: true,
              requireApproval: true,
              defaultRole: "participant",
            },
            createdAt: "2024-01-15T00:00:00Z",
            updatedAt: "2024-03-10T00:00:00Z",
          },
        ]

        const mockNetzwerkCities: NetzwerkCity[] = [
          {
            id: "berlin",
            name: "Berlin",
            country: "Germany",
            organizationId: "gutenberg",
            coordinators: ["user1", "user2"],
            projects: ["project1", "project2"],
            createdAt: "2024-01-01T00:00:00Z",
          },
          {
            id: "munich",
            name: "Munich",
            country: "Germany",
            organizationId: "gutenberg",
            coordinators: ["user3"],
            projects: ["project3"],
            createdAt: "2024-01-15T00:00:00Z",
          },
        ]

        setOrganizations(mockOrganizations)
        setNetzwerkCities(mockNetzwerkCities)
        setCurrentOrganization(mockOrganizations[0])
      } catch (error) {
        console.error("Failed to load organization data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const switchOrganization = (organizationId: string) => {
    const org = organizations.find((o) => o.id === organizationId)
    if (org) {
      setCurrentOrganization(org)
    }
  }

  const value = {
    currentOrganization,
    organizations,
    netzwerkCities,
    switchOrganization,
    loading,
  }

  return <MultiTenantContext.Provider value={value}>{children}</MultiTenantContext.Provider>
}

export function useMultiTenant() {
  const context = useContext(MultiTenantContext)
  if (context === undefined) {
    throw new Error("useMultiTenant must be used within a MultiTenantProvider")
  }
  return context
}
