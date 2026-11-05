export function hasAppAccess(role: unknown): boolean {
   return role === 'artist' || role === 'owner'
}
