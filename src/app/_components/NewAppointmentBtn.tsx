'use client'

import { usePathname, useRouter } from "next/navigation"

export default function NewAppointmentBtn() {
   const router = useRouter()
   const pathname = usePathname()

   if (pathname === '/appointments/new') return null

   return (
      <button
         className="absolute bg-black-primary bottom-6 right-6 flex items-center justify-center transition-colors duration-200 hover:opacity-80 cursor-pointer border border-gray-primary rounded-full aspect-square z-12 w-12 shadow-[0_0_10px_#ffffff10]"
         onClick={() => router.push('/appointments/new')}
      >
         +
      </button>
   )
}
