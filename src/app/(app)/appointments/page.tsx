'use client'

import { usePageHeader } from '@/app/_components/AppShell'

import Appointments from './_components/AppointmentList'

export default function AppointmentsPage() {
   usePageHeader('Turnos')

   return (
      <main className='flex w-full flex-col gap-4 p-4 md:px-8'>
         <header className='mt-4 flex items-start justify-between gap-4 md:hidden'>
            <div className='flex flex-col gap-1'>
               <h1 className='text-2xl font-bold'>
                  Turnos
               </h1>

               <p className='text-sm text-gray-400'>
                  Sesiones agendadas y próximos turnos del estudio.
               </p>
            </div>
         </header>

         <Appointments />
      </main>
   )
}
