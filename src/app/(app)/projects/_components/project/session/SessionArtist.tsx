import type { ArtistOption } from '@/domain/artist/Artist'

interface Props {
   artists: ArtistOption[]
   artist_id: string
   showInput?: boolean
   onChange?: (artist_id: string) => void
   error?: string
}

export default function SessionArtist(props: Props) {
   const artist = props.artists.find((option) => option.id === props.artist_id)

   return (
      <div className='flex min-w-0 items-center gap-1.5 text-sm'>
         <p className='shrink-0'>Tatuador:</p>

         {(props.showInput)
            ? <select
               className={
                  'min-w-0 w-full cursor-pointer bg-black-primary outline-none disabled:cursor-default' +
                  (props.error ? ' text-red-700' : ' text-white')
               }
               value={props.artist_id}
               onChange={(e) => props.onChange?.(e.target.value)}
               disabled={props.artists.length <= 1}
            >
               {(props.artists.length === 0) &&
                  <option value=''>Sin tatuador</option>
               }

               {props.artists.map((option) => (
                  <option key={option.id} value={option.id}>{option.email}</option>
               ))}
            </select>
            : <p className='truncate'>{artist?.email ?? 'Sin tatuador'}</p>
         }
      </div>
   )
}
