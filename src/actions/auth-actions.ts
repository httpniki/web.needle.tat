'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export interface LoginState {
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

   if (data.user.app_metadata.role !== 'artist') {
      await supabase.auth.signOut()
      return { error: 'Esta cuenta no tiene acceso de artista.' }
   }

   redirect('/')
}

export async function logout(): Promise<void> {
   const supabase = createClient(await cookies())
   await supabase.auth.signOut()
   redirect('/login')
}
