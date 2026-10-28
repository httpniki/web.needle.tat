import type { User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'

export const getCurrentArtist = cache(async (): Promise<User | null> => {
   const supabase = createClient(await cookies())
   const { data: { user }, error } = await supabase.auth.getUser()

   if (error || !user) return null
   if (user.app_metadata.role !== 'artist') return null

   return user
})

export async function requireArtist(): Promise<User> {
   const artist = await getCurrentArtist()

   if (!artist) redirect('/login')

   return artist
}
