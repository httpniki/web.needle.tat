import { isToday as isTodayDate } from 'date-fns'

interface Props {
   date: Date
   handlePrevious: () => void
   handleNext: () => void
   handleDate: () => void
}

export default function ScheduleHeader(props: Props) {
   const isToday = isTodayDate(props.date)
   const day_number = props.date.getDate()
   const day_name = props.date
      .toLocaleDateString('es-ES', { weekday: 'long' })
      .replace(/^./, (str) => str.toUpperCase())
   const month_name = props.date
      .toLocaleDateString('es-ES', { month: 'long' })
      .replace(/^./, (str) => str.toUpperCase())

   const year = props.date.getFullYear()

   return (
      <header className="contents">
         <div
            className={
               'sticky top-0 bg-black-primary z-20 flex items-center justify-center gap-2.5 py-4 border-b border-gray-primary' +
               `${(isToday ? ' border-white border-b-2 bg-neutral-900 transition-colors' : '')}`
            }
         >
            <button
               type="button"
               className="cursor-pointer border border-none hover:opacity-80 transition-all"
               aria-label="Mes anterior"
               onClick={props.handlePrevious}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="1.3rem" height="1.3rem" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h15m-10 5.657L4.343 12L10 6.343" />
               </svg>
            </button>

            <button
               className="font-semibold text-center text-nowrap cursor-pointer border-none transition-all hover:opacity-80"
               onClick={props.handleDate}
            >
               {day_name}, {day_number} de {month_name} de {year}
            </button>

            <button
               type="button"
               className="cursor-pointer border border-none hover:opacity-80 transition-all"
               aria-label="Mes siguiente"
               onClick={props.handleNext}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="1.3rem" height="1.3rem" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 12h15m-5 5.657L19.657 12L14 6.343" />
               </svg>
            </button>
         </div>
      </header>
   )
}


