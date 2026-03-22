'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { useAuth } from './AuthProvider'
import type { Tier } from '@/shared/ui/PaywallBlur'

export interface UserProfile {
  id: string
  email: string
  name: string | null
  tier: Tier
  subscription_end: string | null
  created_at: string
}

export function useUserProfile() {
  const { user } = useAuth()
  const supabase = getSupabaseBrowser()

  return useQuery<UserProfile | null>({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, tier, subscription_end, created_at')
        .eq('id', user.id)
        .single()

      if (error) return null
      return data as UserProfile
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}
