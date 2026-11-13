import Loader from '@/components/ui/Loader'
import Artist from '@/domain/artist/Artist'

interface Props {
   artist: Artist
   canManage: boolean
   isDeleting: boolean
   isResending: boolean
   onEdit: () => void
   onDelete: () => void
   onResend: () => void
}

export default function ArtistCard({ artist, canManage, isDeleting, isResending, onEdit, onDelete, onResend }: Props) {
   const isBusy = isDeleting || isResending

   return (
      <article className='flex size-full items-center justify-between gap-4 rounded-md border border-gray-primary bg-black-secondary p-4 shadow-lg'>
         <p className='size-min rounded-full border border-gray-primary p-2 text-white'>
            <svg width="1.4em" height="1.4em" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7C15 5.34315 13.6569 4 12 4ZM7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7ZM12.0001 15C8.3441 15 5.5 17.7501 5.5 20.9999C5.5 21.5522 5.05228 21.9999 4.5 21.9999C3.94772 21.9999 3.5 21.5522 3.5 20.9999C3.5 16.5178 7.37176 13 12.0001 13C16.6283 13 20.5 16.5179 20.5 20.9999C20.5 21.5522 20.0523 21.9999 19.5 21.9999C18.9477 21.9999 18.5 21.5522 18.5 20.9999C18.5 17.7502 15.656 15 12.0001 15Z" fill="currentColor" />
            </svg>
         </p>

         <div className='flex w-full min-w-0 flex-col'>
            <section className='flex h-min w-full min-w-0 items-center justify-between gap-2'>
               <p className='h-min w-full truncate text-sm font-semibold text-white'>
                  {artist.email}
               </p>

               {(canManage === true) &&
                  <div className='flex shrink-0 items-center gap-1.5'>
                     {(artist.role === 'artist' && artist.isInvitationAccepted() === false) &&
                        <button
                           type='button'
                           aria-label={`Reenviar invitación a ${artist.email}`}
                           disabled={isBusy}
                           className='flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-primary bg-black-primary text-white transition-all hover:opacity-85 disabled:cursor-default disabled:opacity-40'
                           onClick={onResend}
                        >
                           {isResending
                              ? <Loader size='14px' />
                              : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className='size-4'>
                                 <path strokeLinecap='round' strokeLinejoin='round' d='M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75' />
                              </svg>
                           }
                        </button>
                     }

                     <button
                        type='button'
                        aria-label={`Editar ${artist.email}`}
                        disabled={isBusy}
                        className='flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-primary bg-black-primary text-white transition-all hover:opacity-85 disabled:cursor-default disabled:opacity-40'
                        onClick={onEdit}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className='size-4'>
                           <path strokeLinecap='round' strokeLinejoin='round' d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125' />
                        </svg>
                     </button>

                     <button
                        type='button'
                        aria-label={`Eliminar ${artist.email}`}
                        disabled={isBusy}
                        className='flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-primary bg-black-primary text-red-700 transition-all hover:opacity-85 disabled:cursor-default disabled:opacity-40'
                        onClick={onDelete}
                     >
                        {isDeleting
                           ? <Loader size='14px' />
                           : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className='size-4'>
                              <path strokeLinecap='round' strokeLinejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />
                           </svg>
                        }
                     </button>
                  </div>
               }
            </section>

            <section>
               <span className={`w-fit rounded-sm border px-2 py-1.5 text-xs font-bold tracking-wide uppercase ${artist.isOwner() ? 'border-gray-primary text-white/80' : 'border-gray-primary text-gray-300'}`}>
                  {artist.role}
               </span>

               {(!artist.isInvitationAccepted()) &&
                  <span className={'w-fit rounded-sm px-2 py-1 text-sm tracking-wide text-nowrap text-white/80'}>
                     Invitacion pendiente
                  </span>
               }
            </section>
         </div>
      </article>
   )
}
