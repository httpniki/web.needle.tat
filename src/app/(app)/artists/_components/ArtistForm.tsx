import { useState } from 'react'

import RenderModal from '@/components/RenderModal'
import Button from '@/components/ui/buttons/Button'
import InputSelect from '@/components/ui/InputSelect'
import Loader from '@/components/ui/Loader'
import Artist, { type ArtistRole } from '@/domain/artist/Artist'

interface Props {
   artist?: Artist
   onSubmit: (artist: Artist) => Promise<void>
   onClose: () => void
}

interface FormState {
   email: string
   role: ArtistRole
   error: string
}

const roleOptions = [
   { value: 'artist', label: 'Artist' },
   { value: 'owner', label: 'Owner' }
]

export default function ArtistForm({ artist, onSubmit, onClose }: Props) {
   const [formState, setFormState] = useState<FormState>({
      email: artist?.email ?? '',
      role: artist?.role ?? 'artist',
      error: ''
   })
   const [isSubmitting, setIsSubmitting] = useState(false)

   const isEditing = artist !== undefined

   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()

      let nextArtist: Artist

      try {
         nextArtist = new Artist({
            id: artist?.id,
            email: formState.email,
            role: formState.role,
            invitationStatus: artist?.invitationStatus
         })
      } catch (error: unknown) {
         const message = error instanceof Error && error.message
            ? error.message
            : 'Los datos del artista no son válidos.'

         setFormState((current) => ({ ...current, error: message }))
         return
      }

      setFormState((current) => ({ ...current, error: '' }))
      setIsSubmitting(true)

      try {
         await onSubmit(nextArtist)
      } catch (error: unknown) {
         const message = error instanceof Error && error.message
            ? error.message
            : isEditing ? 'No se pudo actualizar el artista.' : 'No se pudo enviar la invitación.'

         setFormState((current) => ({ ...current, error: message }))
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <RenderModal onClickOutside={onClose}>
         <form
            className='mx-4 flex w-full max-w-sm flex-col rounded-lg border border-gray-primary bg-black-secondary shadow-2xl'
            onSubmit={handleSubmit}
         >
            <header className='flex flex-col gap-1 border-b border-gray-primary p-4'>
               <h2 className='text-lg font-bold'>
                  {isEditing ? 'Editar artista' : 'Invitar artista'}
               </h2>

               <p className='text-sm text-gray-400'>
                  {isEditing
                     ? 'Modificá el email o el rol del artista.'
                     : 'Se enviará una invitación por email para que defina su contraseña.'}
               </p>
            </header>

            <div className='flex flex-col gap-4 p-4'>
               <label className='flex flex-col gap-1.5'>
                  <span className='text-xs text-gray-400'>
                     Email
                  </span>

                  <input
                     type='email'
                     autoComplete='email'
                     required
                     autoFocus
                     disabled={isSubmitting}
                     value={formState.email}
                     className='w-full rounded-md border border-gray-primary bg-black-primary px-3 py-2 text-sm text-white transition-colors outline-none focus:border-white/40 disabled:opacity-50'
                     onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                  />
               </label>

               {(isEditing === true)
                  ? <label className='flex flex-col gap-1.5'>
                     <span className='text-xs text-gray-400'>
                        Rol
                     </span>

                     <InputSelect
                        options={roleOptions}
                        value={formState.role}
                        disabled={isSubmitting}
                        onChange={(value) => setFormState((current) => ({ ...current, role: value as ArtistRole }))}
                     />
                  </label>
                  : <div className='flex flex-col gap-1.5'>
                     <span className='text-xs text-gray-400'>
                        Rol
                     </span>

                     <span className='w-fit rounded-sm border border-gray-primary px-2 py-1 text-xs font-bold tracking-wide text-white uppercase'>
                        artist
                     </span>
                  </div>
               }

               {(formState.error !== '') &&
                  <p className='rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400'>
                     {formState.error}
                  </p>
               }
            </div>

            <footer className='flex justify-end gap-2 border-t border-gray-primary p-4'>
               <Button
                  disabled={isSubmitting}
                  onClick={onClose}
                  variant='outline'
               >
                  Cancelar
               </Button>

               <Button
                  type='submit'
                  disabled={isSubmitting}
                  variant='filled'
               >
                  {isSubmitting
                     ? <Loader size='16px' />
                     : isEditing ? 'Guardar cambios' : 'Enviar invitación'
                  }
               </Button>
            </footer>
         </form>
      </RenderModal>
   )
}
