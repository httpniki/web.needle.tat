import { CaptionLabelProps } from "@daypicker/react"

export default function CalendarHeader(props: CaptionLabelProps & { date: Date, handlePreviousMonth: () => void, handleNextMonth: () => void }) {
   const { handlePreviousMonth, handleNextMonth, ...captionProps } = props

   return (
      <div className="flex flex-col items-center justify-between w-full px-2 mb-4">
         <div className="flex items-center justify-between w-full">
            <button
               type="button"
               onClick={handlePreviousMonth}
               className="cursor-pointer border border-none hover:opacity-80 transition-all"
               aria-label="Mes anterior"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="1.3rem" height="1.3rem" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h15m-10 5.657L4.343 12L10 6.343" />
               </svg>
            </button>

            <h2 className="text-lg font-semibold text-white capitalize">
               {props.date.toLocaleString('default', { month: 'long' })} {props.date.getFullYear()}
            </h2>

            <button
               type="button"
               onClick={handleNextMonth}
               className="cursor-pointer border border-none hover:opacity-80 transition-all"
               aria-label="Mes siguiente"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="1.3rem" height="1.3rem" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 12h15m-5 5.657L19.657 12L14 6.343" />
               </svg>
            </button>
         </div>

         <h1 className='text-[#B3B3B3]'>Calendario</h1>
      </div>
   )
}

