import { redirect } from 'next/navigation'

import { getArtists } from '@/actions/artist-actions'
import type { ArtistObject } from '@/domain/artist/Artist'
import { requireArtist } from '@/lib/auth'

import ArtistsPageClient from './_components/ArtistsPageClient'

export default async function ArtistsPage() {
   const user = await requireArtist()

   if (user.app_metadata.role !== 'owner') redirect('/')

   const canManage = user.app_metadata.role === 'owner'
   let artists: ArtistObject[] = []
   let initialError = ''

   try {
      artists = await getArtists()
   } catch (error: unknown) {
      initialError = error instanceof Error && error.message
         ? error.message
         : 'No se pudieron cargar los artistas.'
   }

   return <ArtistsPageClient
      initialArtists={artists}
      canManage={canManage}
      initialError={initialError}
   />
}
