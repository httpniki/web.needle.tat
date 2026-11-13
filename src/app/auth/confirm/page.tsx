'use client'

import { useEffect, useRef } from 'react'

import Loader from '@/components/ui/Loader'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmInvitePage() {
   const started = useRef(false)

   useEffect(() => {
      if (started.current) return
      started.current = true

      async function confirmInvite() {
         const supabase = createClient()
         const searchParams = new URLSearchParams(window.location.search)
         const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
         const tokenHash = searchParams.get('token_hash')
         const type = searchParams.get('type')
         const accessToken = hashParams.get('access_token')
         const refreshToken = hashParams.get('refresh_token')
         const hashError = hashParams.get('error_description') ?? hashParams.get('error')

         if (hashError) {
            window.location.replace('/login?error=invite')
            return
         }

         // Custom Supabase email template using token_hash.
         if (tokenHash && type === 'invite') {
            const { error } = await supabase.auth.verifyOtp({
               token_hash: tokenHash,
               type: 'invite'
            })

            if (!error) {
               window.location.replace('/auth/set-password')
               return
            }
         }

         // Default Supabase template using ConfirmationURL.
         if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
               access_token: accessToken,
               refresh_token: refreshToken
            })

            if (!error) {
               window.location.replace('/auth/set-password')
               return
            }
         }

         window.location.replace('/login?error=invite')
      }

      confirmInvite()
   }, [])

   return (
      <main className='flex min-h-screen items-center justify-center bg-black-primary p-4'>
         <section className='flex flex-col items-center gap-4 text-center'>
            <Loader size='24px' />

            <p className='text-sm text-white/60'>
               Verificando invitación...
            </p>
         </section>
      </main>
   )
}
