import type { Metadata } from 'next'

import { requireArtist } from '@/lib/auth'

import SetPasswordForm from './_components/SetPasswordForm'

export const metadata: Metadata = {
   title: 'Definir contraseña - Needle.tat'
}

export default async function SetPasswordPage() {
   const artist = await requireArtist()

   return (
      <main className='flex min-h-screen items-center justify-center bg-black-primary p-4'>
         <section className='flex w-full max-w-sm flex-col gap-8'>
            <header className='flex flex-col items-center gap-2 text-center'>
               <h1 className='text-3xl font-bold'>
                  Definí tu contraseña
               </h1>

               <p className='text-white/60'>
                  Completá el acceso para {artist.email ?? 'tu cuenta'}.
               </p>
            </header>

            <SetPasswordForm />
         </section>
      </main>
   )
}
