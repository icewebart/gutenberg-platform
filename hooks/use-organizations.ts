import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Organization, NetzwerkCity } from '@/types/organization'
import { useAuth } from '@/components/auth-context'

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [netzwerkCities, setNetzwerkCities] = useState<NetzwerkCity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch organizations
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .order('created_at', { ascending: true })

        if (orgsError) throw orgsError

        const transformedOrgs: Organization[] = (orgsData || []).map((o) => ({
          id: o.id,
          name: o.name,
          domain: o.domain,
          settings: (o.settings as any) || {
            allowRegistration: true,
            requireApproval: false,
            defaultRole: 'volunteer',
          },
          createdAt: o.created_at,
          updatedAt: o.updated_at,
        }))

        setOrganizations(transformedOrgs)

        // Fetch netzwerk cities if user is logged in
        if (user) {
          const { data: citiesData, error: citiesError } = await supabase
            .from('netzwerk_cities')
            .select('*')
            .eq('organization_id', user.organizationId)
            .order('created_at', { ascending: true })

          if (citiesError) throw citiesError

          const transformedCities: NetzwerkCity[] = (citiesData || []).map((c) => ({
            id: c.id,
            name: c.name,
            country: c.country,
            organizationId: c.organization_id,
            coordinators: c.coordinators || [],
            projects: c.projects || [],
            createdAt: c.created_at,
          }))

          setNetzwerkCities(transformedCities)
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching organizations:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch organizations')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  return {
    organizations,
    netzwerkCities,
    loading,
    error,
  }
}

