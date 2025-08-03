"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface Organization {
  id: string
  name: string
  description: string
}

interface City {
  id: string
  name: string
  country: string
}

interface MultiTenantContextType {
  currentOrganization: Organization | null
  currentCity: City | null
  setCurrentOrganization: (org: Organization) => void
  setCurrentCity: (city: City) => void
}

const MultiTenantContext = createContext<MultiTenantContextType | undefined>(undefined)

export function MultiTenantProvider({ children }: { children: React.ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>({
    id: "1",
    name: "Gutenberg Foundation",
    description: "Main organization",
  })
  const [currentCity, setCurrentCity] = useState<City | null>({
    id: "1",
    name: "New York",
    country: "USA",
  })

  const value = {
    currentOrganization,
    currentCity,
    setCurrentOrganization,
    setCurrentCity,
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
