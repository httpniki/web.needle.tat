'use server'

import type { User } from '@supabase/supabase-js'
import { headers } from 'next/headers'

import type { ArtistInvitationStatus, ArtistObject, ArtistOption } from '@/domain/artist/Artist'
import { requireArtist } from '@/lib/auth'
import { hasAppAccess, isArtistRole } from '@/lib/roles'
import { createAdminClient } from '@/lib/supabase/admin'

import ActionException from '../utils/exceptions/action-exception'

export async function getArtists(): Promise<ArtistObject[]> {
   await requireOwner()

   const admin = createAdminClient()
   const users = await listAllUsers(admin)

   return users
      .filter((user) => user.email && hasAppAccess(user.app_metadata.role))
      .map(toArtistObject)
      .sort((a, b) => a.email.localeCompare(b.email))
}

export async function getArtistOptions(): Promise<ArtistOption[]> {
   const currentArtist = await requireArtist()
   const currentRole = isArtistRole(currentArtist.app_metadata.role) ? currentArtist.app_metadata.role : 'artist'
   const currentOption: ArtistOption = {
      id: currentArtist.id,
      email: currentArtist.email ?? '',
      role: currentRole
   }

   if (currentArtist.app_metadata.role !== 'owner') return [currentOption]

   const admin = createAdminClient()
   const users = await listAllUsers(admin)

   return users
      .filter((user) => user.email && hasAppAccess(user.app_metadata.role))
      .map((user) => ({
         id: user.id,
         email: user.email ?? '',
         role: isArtistRole(user.app_metadata.role) ? user.app_metadata.role : 'artist'
      }))
      .sort((a, b) => {
         if (a.id === currentArtist.id) return -1
         if (b.id === currentArtist.id) return 1

         return a.email.localeCompare(b.email)
      })
}

export async function createArtist(email: string): Promise<ArtistObject> {
   await requireOwner()

   const normalizedEmail = validateArtistEmail(email)
   const siteUrl = await getSiteUrl()
   const admin = createAdminClient()

   const { data, error } = await admin.auth.admin.inviteUserByEmail(normalizedEmail, {
      redirectTo: `${siteUrl}/auth/confirm`
   })

   if (error || !data.user) {
      const err = new ActionException('Error inesperado al invitar al artista')

      err.name = error?.code === 'email_exists' || error?.code === 'user_already_exists'
         ? 'artist_email_exists'
         : 'unexpected_error'

      throw err
   }

   const { data: updatedData, error: updatedError } = await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: {
         ...data.user.app_metadata,
         role: 'artist',
         password_set: false
      }
   })

   if (updatedError || !updatedData.user) {
      await admin.auth.admin.deleteUser(data.user.id)

      const err = new ActionException('Error inesperado al asignar el rol del artista')
      err.name = 'unexpected_error'
      throw err
   }

   return toArtistObject(updatedData.user)
}

export async function resendArtistInvitation(id: string): Promise<ArtistObject> {
   await requireOwner()

   const admin = createAdminClient()
   const { data: currentData, error: currentError } = await admin.auth.admin.getUserById(id)

   if (currentError || !currentData.user || !currentData.user.email) {
      const err = new ActionException('Artista no encontrado')
      err.name = 'artist_not_found'
      err.data = { id }
      throw err
   }

   if (isInvitationAccepted(currentData.user)) {
      const err = new ActionException('La invitación ya fue aceptada')
      err.name = 'artist_invitation_already_accepted'
      err.data = { id }
      throw err
   }

   const role = isArtistRole(currentData.user.app_metadata.role)
      ? currentData.user.app_metadata.role
      : 'artist'

   // Supabase refuses to re-invite an email that was already confirmed. If the
   // user confirmed the email but never set a password, recreate the account
   // so a fresh invitation can be sent.
   if (Boolean(currentData.user.email_confirmed_at ?? currentData.user.confirmed_at) && currentData.user.app_metadata.password_set === false) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(id)

      if (deleteError) {
         const err = new ActionException('Error inesperado al restablecer la invitación')
         err.name = deleteError.code === 'user_not_found' ? 'artist_not_found' : 'unexpected_error'
         err.data = { id }
         throw err
      }
   }

   const siteUrl = await getSiteUrl()
   const { data, error } = await admin.auth.admin.inviteUserByEmail(currentData.user.email, {
      redirectTo: `${siteUrl}/auth/confirm`
   })

   if (error || !data.user) {
      const err = new ActionException('Error inesperado al reenviar la invitación')
      err.name = 'unexpected_error'
      err.data = { id }
      throw err
   }

   const { data: updatedData, error: updatedError } = await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: {
         ...data.user.app_metadata,
         role,
         password_set: false
      }
   })

   if (updatedError || !updatedData.user) {
      await admin.auth.admin.deleteUser(data.user.id)

      const err = new ActionException('Error inesperado al actualizar el artista después del reenvío')
      err.name = 'unexpected_error'
      err.data = { id }
      throw err
   }

   return toArtistObject(updatedData.user)
}

export async function updateArtist(id: string, body: ArtistObject): Promise<ArtistObject> {
   await requireOwner()

   const normalizedEmail = validateArtistEmail(body.email)

   if (!isArtistRole(body.role)) {
      const err = new ActionException('Rol de artista inválido')
      err.name = 'invalid_artist_role'
      throw err
   }

   const admin = createAdminClient()
   const { data: currentData, error: currentError } = await admin.auth.admin.getUserById(id)

   if (currentError || !currentData.user) {
      const err = new ActionException('Artista no encontrado')
      err.name = 'artist_not_found'
      err.data = { id }
      throw err
   }

   const { data, error } = await admin.auth.admin.updateUserById(id, {
      email: normalizedEmail,
      email_confirm: isInvitationAccepted(currentData.user),
      app_metadata: {
         ...currentData.user.app_metadata,
         role: body.role
      }
   })

   if (error || !data.user) {
      const err = new ActionException('Error inesperado al actualizar el artista')
      err.name = error?.code === 'email_exists' || error?.code === 'user_already_exists'
         ? 'artist_email_exists'
         : 'unexpected_error'
      throw err
   }

   return toArtistObject(data.user)
}

export async function deleteArtist(id: string): Promise<void> {
   await requireOwner()

   const admin = createAdminClient()
   const { error } = await admin.auth.admin.deleteUser(id)

   if (error) {
      const err = new ActionException('Error inesperado al eliminar el artista')
      err.name = error.code === 'user_not_found'
         ? 'artist_not_found'
         : 'unexpected_error'
      err.data = { id }
      throw err
   }
}

async function requireOwner(): Promise<User> {
   const artist = await requireArtist()

   if (artist.app_metadata.role !== 'owner') {
      const err = new ActionException('Solo el owner puede gestionar artistas')
      err.name = 'forbidden'
      throw err
   }

   return artist
}

async function listAllUsers(admin: ReturnType<typeof createAdminClient>): Promise<User[]> {
   const users: User[] = []
   const perPage = 1000
   let page = 1

   while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage })

      if (error) {
         const err = new ActionException('Error inesperado al obtener los artistas')
         err.name = 'unexpected_error'
         throw err
      }

      users.push(...data.users)

      if (data.users.length < perPage) break

      page += 1
   }

   return users
}

async function getSiteUrl(): Promise<string> {
   const headersList = await headers()
   const origin = headersList.get('origin')

   if (origin) return origin.replace(/\/$/, '')

   const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
   const protocol = headersList.get('x-forwarded-proto') ?? 'http'

   if (host) return `${protocol}://${host}`

   const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

   if (!siteUrl) {
      const err = new ActionException('La URL del sitio no está configurada')
      err.name = 'missing_site_url'
      throw err
   }

   return siteUrl.replace(/\/$/, '')
}

function validateArtistEmail(value: string): string {
   const email = value.trim().toLowerCase()

   if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = new ActionException('Email de artista inválido')
      err.name = 'invalid_artist_email'
      throw err
   }

   return email
}

function isInvitationAccepted(user: User): boolean {
   if (user.app_metadata.password_set === true) return true
   if (user.app_metadata.password_set === false) return false

   return Boolean(user.email_confirmed_at ?? user.confirmed_at ?? user.last_sign_in_at)
}

function getInvitationStatus(user: User): ArtistInvitationStatus {
   return isInvitationAccepted(user) ? 'accepted' : 'pending'
}

function toArtistObject(user: User): ArtistObject {
   return {
      id: user.id,
      email: user.email ?? '',
      role: isArtistRole(user.app_metadata.role) ? user.app_metadata.role : 'artist',
      invitationStatus: getInvitationStatus(user)
   }
}
