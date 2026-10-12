import { CaptionLabelProps } from '@daypicker/react'

type Props = CaptionLabelProps & {
   date: Date
   handlePreviousMonth: () => void
   handleNextMonth: () => void
}

export default function CalendarHeader(props: Props) {
   const { handlePreviousMonth, handleNextMonth, ..._captionProps } = props

   return (
      <div className="mb-4 flex w-full items-center justify-between px-2">
         <div className="flex w-full items-center justify-between">
            <button
               type="button"
               onClick={handlePreviousMonth}
               className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-primary px-3 py-1 transition-all hover:opacity-80"
               aria-label="Mes anterior"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h15m-10 5.657L4.343 12L10 6.343" />
               </svg>

               Anterior
            </button>
         </div>

         <div>
            <h2 className="text-lg font-semibold text-nowrap text-white capitalize">
               {props.date?.toLocaleString('default', { month: 'long' })}
               {' ' + props.date?.getFullYear()}
            </h2>

            <h1 className='text-[#B3B3B3]'>Calendario</h1>
         </div>

         <div className="flex w-full items-center justify-end">
            <button
               type="button"
               onClick={handleNextMonth}
               className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-primary px-3 py-1 transition-all hover:opacity-80"
               aria-label="Mes siguiente"
            >
               Siguiente

               <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 12h15m-5 5.657L19.657 12L14 6.343" />
               </svg>
            </button>
         </div>

      </div>
   )
}

