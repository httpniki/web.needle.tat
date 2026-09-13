'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function NewAppointmentBtn() {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   if (pathname === '/appointments' && searchParams.get('new')) return null

   return (
      <button
         className="fixed right-8 bottom-8 z-12 flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full border border-gray-primary bg-black-primary shadow-[0_0_10px_#ffffff10] transition-colors duration-200 hover:opacity-80"
         onClick={() => router.push('/appointments?new=true')}
      >
         +
      </button>
   )
}
