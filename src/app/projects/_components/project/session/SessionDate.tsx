import { format } from 'date-fns'

interface Props {
   date: Date
   showButton?: boolean
   onClick?: () => void
   error?: string
}

export default function SessionDate(props: Props) {
   return (
      <div className="flex max-w-48 items-center gap-1.5">
         <p>Fecha:</p>

         {(!props.showButton) &&
            <p>{format(props.date, 'dd/MM/yyyy')}</p>
         }

         {(props.showButton) &&
            <button
               className='w-full cursor-pointer rounded-md border border-gray-primary px-2 py-1 text-center text-sm outline-none hover:opacity-85'
               onClick={props.onClick}
            >
               {format(props.date, 'dd/MM/yyyy')}
            </button>
         }
      </div>
   )
}

