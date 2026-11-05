import { useRef } from 'react'

import { logout } from '@/actions/auth-actions'
import RenderModal from '@/components/RenderModal'
import Button from '@/components/ui/buttons/Button'

interface Props {
   email: string
   role: string
   onClose: () => void
   position: {
      x: number,
      y: number
   }
}

export default function AccountModal({ email, role, onClose, position }: Props) {
   const ref = useRef<HTMLDivElement | null>(null)

   return (
      <RenderModal
         className='bg-black/0'
         onClickOutside={onClose}
      >
         <div
            className='flex size-full flex-col bg-black-primary md:absolute md:size-auto md:h-max md:w-full md:max-w-sm md:rounded-lg md:border md:border-gray-primary md:shadow-2xl'
            ref={ref}
            style={{
               top: position.y,
               right: 0
            }}
         >
            <header className='flex items-start justify-between gap-4 border-b border-gray-primary p-4 md:border-0 md:px-6 md:pt-6'>
               <div className='flex flex-col gap-1'>
                  <h2 className='text-lg font-bold'>
                     Mi cuenta
                  </h2>
               </div>
            </header>

            <div className='flex flex-1 flex-col gap-5 p-4 md:px-6 md:py-5'>
               <div className='flex flex-col gap-1'>
                  <span className='text-xs text-gray-400'>
                     Email
                  </span>

                  <p className='text-sm break-all text-white'>
                     {email}
                  </p>
               </div>

               <div className='flex flex-col gap-1'>
                  <span className='text-xs text-gray-400'>
                     Rol
                  </span>

                  <span className='w-fit rounded-sm border border-gray-primary px-2 py-1 text-xs font-bold tracking-wide text-white uppercase'>
                     {role}
                  </span>
               </div>
            </div>

            <footer className='flex flex-col gap-2 border-t border-gray-primary p-4 md:border-0 md:px-6 md:pb-6'>
               <Button
                  variant='outline'
                  className='w-full md:hidden'
                  onClick={onClose}
               >
                  Cerrar
               </Button>

               <Button
                  type='submit'
                  variant='filled'
                  className='w-full'
                  onClick={logout}
               >
                  Cerrar sesión
               </Button>
            </footer>
         </div>
      </RenderModal>
   )
}
