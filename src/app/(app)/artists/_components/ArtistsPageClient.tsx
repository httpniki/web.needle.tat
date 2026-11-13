'use client'

import { useState } from 'react'

import { createArtist, deleteArtist, resendArtistInvitation, updateArtist } from '@/actions/artist-actions'
import { usePageHeader } from '@/app/(app)/_components/AppShell'
import { useToast } from '@/app/(app)/_context/ToastContext'
import Button from '@/components/ui/buttons/Button'
import Artist, { type ArtistObject } from '@/domain/artist/Artist'

import ArtistCard from './ArtistCard'
import ArtistForm from './ArtistForm'
import DeleteArtistModal from './DeleteArtistModal'

interface Props {
   initialArtists: ArtistObject[]
   canManage: boolean
   initialError: string
}

export default function ArtistsPageClient({ initialArtists, canManage, initialError }: Props) {
   usePageHeader('Artistas')
   const toast = useToast()

   const [artists, setArtists] = useState<Artist[]>(() => initialArtists.map((artist) => new Artist(artist)))
   const [artistForm, setArtistForm] = useState<{
      isOpen: boolean
      artist: Artist | null
   }>({
      isOpen: false,
      artist: null
   })
   const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null)
   const [deletingArtistId, setDeletingArtistId] = useState<string | null>(null)
   const [resendingArtistId, setResendingArtistId] = useState<string | null>(null)

   async function handleSaveArtist(artist: Artist) {
      const editingArtist = artistForm.artist
      let savedArtist: ArtistObject

      try {
         if (editingArtist) {
            savedArtist = await updateArtist(editingArtist.id, artist.toObject())
         } else {
            savedArtist = await createArtist(artist.email)
         }
      } catch (error: unknown) {
         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: 'No se pudo guardar el artista.', type: 'error' })

         throw error
      }

      setArtists((current) => {
         const nextArtists = editingArtist
            ? current.map((item) => item.id === savedArtist.id ? new Artist(savedArtist) : item)
            : [...current, new Artist(savedArtist)]

         return nextArtists.sort((a, b) => a.email.localeCompare(b.email))
      })

      toast.add({
         title: 'Listo',
         message: editingArtist
            ? 'Artista actualizado.'
            : `Invitación enviada a ${savedArtist.email}.`,
         type: 'success'
      })

      setArtistForm({ isOpen: false, artist: null })
   }

   async function handleResendInvitation(artist: Artist) {
      if (resendingArtistId !== null) return

      setResendingArtistId(artist.id)

      try {
         const updatedArtist = await resendArtistInvitation(artist.id)

         setArtists((current) => current.map((item) => item.id === artist.id ? new Artist(updatedArtist) : item))
         toast.add({
            title: 'Invitación reenviada',
            message: `Se envió una nueva invitación a ${artist.email}.`,
            type: 'success'
         })
      } catch (error: unknown) {
         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: 'No se pudo reenviar la invitación.', type: 'error' })
      } finally {
         setResendingArtistId(null)
      }
   }

   async function handleDeleteArtist(artist: Artist) {
      if (deletingArtistId !== null) return

      setDeletingArtistId(artist.id)

      try {
         await deleteArtist(artist.id)
      } catch (error: unknown) {
         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: 'No se pudo eliminar el artista.', type: 'error' })
         return
      } finally {
         setDeletingArtistId(null)
      }

      setArtists((current) => current.filter((item) => item.id !== artist.id))
      setArtistToDelete(null)
   }

   return (
      <main className='flex w-full flex-col gap-4 p-4 md:px-8'>
         <header className='mt-4 flex items-start justify-between gap-4'>
            <div className='flex flex-col gap-1'>
               <h1 className='text-2xl font-bold'>
                  Artistas
               </h1>

               <p className='text-sm text-gray-400'>
                  Artistas registrados en el estudio.
               </p>
            </div>

            {(canManage === true) &&
               <Button
                  variant='filled'
                  className='shrink-0'
                  onClick={() => setArtistForm({ isOpen: true, artist: null })}
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="1em" height="1em">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>

                  Invitar artista
               </Button>
            }
         </header>

         {(canManage === false) &&
            <p className='text-xs text-gray-400'>
               Solo el owner puede administrar artistas.
            </p>
         }

         {(initialError !== '') &&
            <p className='rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400'>
               {initialError}
            </p>
         }

         {(artists.length === 0 && initialError === '') &&
            <p className='text-sm text-gray-400'>
               No hay artistas registrados.
            </p>
         }

         {(artists.length > 0) &&
            <ul className='grid gap-2 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]'>
               {artists.map((artist) =>
                  <li key={artist.id} className='min-w-0'>
                     <ArtistCard
                        artist={artist}
                        canManage={canManage}
                        isDeleting={deletingArtistId === artist.id}
                        isResending={resendingArtistId === artist.id}
                        onEdit={() => setArtistForm({ isOpen: true, artist })}
                        onDelete={() => setArtistToDelete(artist)}
                        onResend={() => handleResendInvitation(artist)}
                     />
                  </li>
               )}
            </ul>
         }

         {(artistForm.isOpen === true) &&
            <ArtistForm
               key={artistForm.artist?.id ?? 'new'}
               artist={artistForm.artist ?? undefined}
               onSubmit={handleSaveArtist}
               onClose={() => setArtistForm({ isOpen: false, artist: null })}
            />
         }

         {(artistToDelete !== null) &&
            <DeleteArtistModal
               artist={artistToDelete}
               isDeleting={deletingArtistId === artistToDelete.id}
               onConfirm={() => handleDeleteArtist(artistToDelete)}
               onClose={() => {
                  if (deletingArtistId === null) setArtistToDelete(null)
               }}
            />
         }

      </main>
   )
}
