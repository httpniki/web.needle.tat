'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { requireArtist } from '@/lib/auth'
import { hasAppAccess } from '@/lib/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface LoginState {
   error?: string
}

export interface SetPasswordState {
   error?: string
}

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
   const email = String(formData.get('email') ?? '').trim()
   const password = String(formData.get('password') ?? '')

   if (!email || !password) {
      return { error: 'Ingresá tu email y contraseña.' }
   }

   const supabase = createClient(await cookies())
   const { data, error } = await supabase.auth.signInWithPassword({ email, password })

   if (error || !data.user) {
      return { error: 'Email o contraseña incorrectos.' }
   }

   if (!hasAppAccess(data.user.app_metadata.role)) {
      await supabase.auth.signOut()
      return { error: 'Esta cuenta no tiene acceso a la aplicación.' }
   }

   redirect('/')
}

export async function setPassword(_previousState: SetPasswordState, formData: FormData): Promise<SetPasswordState> {
   const artist = await requireArtist()

   const password = String(formData.get('password') ?? '')
   const confirmation = String(formData.get('confirmation') ?? '')

   if (password.length < 6) {
      return { error: 'La contraseña debe tener al menos 6 caracteres.' }
   }

   if (password !== confirmation) {
      return { error: 'Las contraseñas no coinciden.' }
   }

   const supabase = createClient(await cookies())
   const { error } = await supabase.auth.updateUser({ password })

   if (error) {
      return { error: 'No se pudo actualizar la contraseña. Intentá de nuevo.' }
   }

   const admin = createAdminClient()

   const { error: metadataError } = await admin.auth.admin.updateUserById(artist.id, {
      app_metadata: {
         ...artist.app_metadata,
         password_set: true
      }
   })

   if (metadataError) {
      return { error: 'La contraseña se guardó, pero no se pudo completar la configuración. Intentá de nuevo.' }
   }

   redirect('/')
}

export async function logout(): Promise<void> {
   const supabase = createClient(await cookies())
   await supabase.auth.signOut()

   redirect('/login')
}
