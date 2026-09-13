'use client'

import { useRouter } from "next/navigation"

export default function NotFoundPage() {
   const router = useRouter()

   return (
      <main className='flex flex-col items-center justify-center size-full font-bold'>
         <h1 className='text-2xl'>404 - Not found</h1>
         <p className='text-xl mt-1.5'>Pagina no encontrada :(</p>

         <button onClick={() => router.push('/')} className='flex items-center justify-center gap-2 bg-gray-primary text-md border border-white/20 rounded-sm py-2 px-4 mt-4 hover:opacity-80 transition-all duration-300 cursor-pointer'>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.3rem" height="1.3rem" viewBox="0 0 24 24">
               <path d="M0 0h24v24H0z" fill="none" />
               <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h15m-10 5.657L4.343 12L10 6.343" />
            </svg>

            Volver al inicio
         </button>
      </main>
   )
}
