import type { ArtistRole } from '@/domain/artist/Artist'

export function isArtistRole(role: unknown): role is ArtistRole {
   return role === 'artist' || role === 'owner'
}

export function hasAppAccess(role: unknown): boolean {
   return isArtistRole(role)
}
