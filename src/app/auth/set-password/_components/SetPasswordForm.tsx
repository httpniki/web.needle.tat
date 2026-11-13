'use client'

import { useActionState } from 'react'

import { setPassword, type SetPasswordState } from '@/actions/auth-actions'
import Loader from '@/components/ui/Loader'

const initialState: SetPasswordState = {}

export default function SetPasswordForm() {
   const [state, formAction, isPending] = useActionState(setPassword, initialState)

   return (
      <form action={formAction} className='flex w-full max-w-sm flex-col gap-4'>
         <label className='flex flex-col gap-1.5 text-sm text-white/70'>
            Contraseña
            <input
               name='password'
               type='password'
               autoComplete='new-password'
               minLength={6}
               required
               disabled={isPending}
               className='rounded-sm border border-gray-primary bg-black-secondary px-3 py-2 text-white transition-colors outline-none focus:border-white/40 disabled:opacity-50'
            />
         </label>

         <label className='flex flex-col gap-1.5 text-sm text-white/70'>
            Confirmar contraseña
            <input
               name='confirmation'
               type='password'
               autoComplete='new-password'
               minLength={6}
               required
               disabled={isPending}
               className='rounded-sm border border-gray-primary bg-black-secondary px-3 py-2 text-white transition-colors outline-none focus:border-white/40 disabled:opacity-50'
            />
         </label>

         {state.error && (
            <p role='alert' className='text-sm text-red-400'>
               {state.error}
            </p>
         )}

         <button
            type='submit'
            disabled={isPending}
            className='mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-white/20 bg-gray-primary px-4 py-2 font-semibold transition-all duration-300 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50'
         >
            {isPending && <Loader size={18} className='border-white/30 border-t-white' />}
            {isPending ? 'Guardando...' : 'Guardar contraseña'}
         </button>
      </form>
   )
}
