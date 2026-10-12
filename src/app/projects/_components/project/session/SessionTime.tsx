import { format } from 'date-fns'

interface Props {
   starts_at: Date
   ends_at: Date
   showButton?: boolean
   onClick?: () => void
   error?: string
}

export default function SessionTime(props: Props) {
   return (
      <div className='flex max-w-48 items-center gap-1.5'>
         <p>Hora:</p>

         {(!props.showButton) &&
            <>
               <p>{format(props.starts_at, 'HH:mm')}</p>

               <p> - </p>

               <p>{format(props.ends_at, 'HH:mm')}</p>
            </>
         }

         {(props.showButton) &&
            <>
               <button
                  className='w-full cursor-pointer rounded-md border border-gray-primary px-2 py-1 text-center text-sm outline-none hover:opacity-85'
                  onClick={props.onClick}
               >
                  {format(props.starts_at, 'HH:mm')}
               </button>

               <p> - </p>

               <button
                  className='w-full cursor-pointer rounded-md border border-gray-primary px-2 py-1 text-center text-sm outline-none hover:opacity-85'
                  onClick={props.onClick}
               >
                  {format(props.ends_at, 'HH:mm')}
               </button>
            </>
         }
      </div>
   )
}
