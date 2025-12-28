import type { User } from '@/types/organization'
import type { Database } from './database.types'

type SupabaseUser = Database['public']['Tables']['users']['Row']

/**
 * Transform Supabase user row to our User type
 */
export function transformSupabaseUser(supabaseUser: SupabaseUser, authUser: { id: string; email: string }): User {
  return {
    id: supabaseUser.id,
    name: supabaseUser.name,
    email: supabaseUser.email,
    phone: supabaseUser.phone || undefined,
    role: supabaseUser.role as User['role'],
    department: supabaseUser.department as User['department'],
    organizationId: supabaseUser.organization_id,
    netzwerkCityId: supabaseUser.netzwerk_city_id || undefined,
    permissions: supabaseUser.permissions || [],
    avatar: supabaseUser.avatar || undefined,
    isActive: supabaseUser.is_active,
    isVerified: supabaseUser.is_verified,
    status: supabaseUser.status as User['status'],
    lastLogin: supabaseUser.last_login || undefined,
    createdAt: supabaseUser.created_at,
    yearsOfActivity: supabaseUser.years_of_activity || [],
    profile: {
      bio: (supabaseUser.profile as any)?.bio,
      location: (supabaseUser.profile as any)?.location,
      skills: (supabaseUser.profile as any)?.skills || [],
      interests: (supabaseUser.profile as any)?.interests || [],
      availability: (supabaseUser.profile as any)?.availability || '',
      address: (supabaseUser.profile as any)?.address,
      socialLinks: (supabaseUser.profile as any)?.socialLinks || {},
      wasMemberInNetzwerk: (supabaseUser.profile as any)?.wasMemberInNetzwerk,
    },
    gamification: {
      points: (supabaseUser.gamification as any)?.points || 0,
      level: (supabaseUser.gamification as any)?.level || 1,
      badges: (supabaseUser.gamification as any)?.badges || [],
      achievements: (supabaseUser.gamification as any)?.achievements || [],
    },
    projectHistory: [],
    activityLog: [],
    pointsHistory: [],
    watchedCourses: [],
    enrolledCourses: [],
  }
}

