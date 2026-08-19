'use client'

import RenderModal from "@/components/RenderModal"
import { CaptionLabelProps, DayButtonProps, DayPicker } from "@daypicker/react"
import { addMonths, subMonths } from "date-fns"
import { useState } from "react"

interface SelectedDayState {
   date: Date
}

export default function Calendar() {
   const [date, setDate] = useState(new Date())
   const [selectedDay, setSelectedDay] = useState<SelectedDayState | null>(null)

   const showPreviousMonth = () => setDate((prev) => subMonths(prev, 1));
   const showNextMonth = () => setDate((prev) => addMonths(prev, 1));

   return (
      <main className="size-full flex flex-1 flex-col">
         <DayPicker
            selected={date}
            onSelect={(_, date) => date ? setSelectedDay({ date }) : setSelectedDay(null)}
            className="w-full flex-1 flex flex-col"
            classNames={{
               month_caption: 'text-center',
               nav: 'hidden flex items-center gap-2 pt-2 justify-between',
               months: 'flex flex-col flex-1 h-full w-full',
               month: 'flex flex-col flex-1 h-full w-full gap-4',
               month_grid: 'w-full h-full border-collapse gap-1 flex flex-col flex-1',
               weekdays: 'flex w-full justify-between',
               weekday: 'flex-1 text-center font-medium text-sm text-gray-400',
               weeks: 'w-full flex flex-col flex-1 gap-2',
               week: 'flex w-full flex-1 gap-2',
               day: 'flex-1 0 h-full p-0 text-center bg-black-secondary rounded-xl hover:bg-neutral-900 transition-colors',
               day_button: 'cursor-pointer w-full h-full flex flex-col justify-start items-start p-3 outline-none',
               outside: 'opacity-30',
               selected: 'outline outline-white font-bold'
            }}
            showOutsideDays
            components={{
               DayButton,
               CaptionLabel: (props) => <CaptionLabel {...props} date={date} handlePreviousMonth={showPreviousMonth} handleNextMonth={showNextMonth} />,
            }}
            mode='single'
         />

         {(selectedDay) &&
            <RenderModal onClickOutside={() => setSelectedDay(null)}>
               <div className="px-6 py-4 flex flex-col items-center gap-5 max-w-96 w-full bg-black-secondary rounded-xl">
                  <p className='font-bold w-full text-center border-b border-gray-primary pb-2'>
                     {selectedDay?.date.toLocaleString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
               </div>
            </RenderModal>
         }
      </main>
   )
}

function DayButton(props: DayButtonProps) {
   const { day, modifiers, ...buttonProps } = props
   return (
      <button {...buttonProps}>
         {day.date.getDate()}
      </button>
   )
}

function CaptionLabel(props: CaptionLabelProps & { date: Date, handlePreviousMonth: () => void, handleNextMonth: () => void }) {
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


