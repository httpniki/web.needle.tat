'use client'

import { CaptionLabelProps, DayButtonProps, DayPicker, DayPickerProps, DayProps } from "@daypicker/react"
import { useState } from "react"

function DayButton(props: DayButtonProps) {
   const { day, modifiers, ...buttonProps } = props
   return (
      <button {...buttonProps}>
         {day.date.getDate()}
      </button>
   )
}

export default function Calendar() {
   const [date, setDate] = useState(new Date())

   return (
      <main className="size-full flex flex-1 flex-col">
         <h1>Calendar</h1>

         <DayPicker
            selected={date}
            onSelect={(date) => (date) ? setDate(date) : null}
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
               day_button: 'cursor-pointer w-full h-full flex flex-col justify-start items-start p-3',
               outside: 'opacity-30',
               selected: 'outline outline-gray-primary font-bold'
            }}
            showOutsideDays
            components={{ DayButton }}
            mode='single'
         />
      </main>
   )
}

