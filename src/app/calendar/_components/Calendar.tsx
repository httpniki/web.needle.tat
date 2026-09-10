'use client'

import { DayPicker } from "@daypicker/react"
import CalendarHeader from "./CalendarHeader"
import CalendarDayButton from "./CalendarDayButton"
import { useState } from "react"
import { useTattooProjects } from "@/app/_context/TattooProjectsContext"
import { addMonths, isSameDay, subMonths } from "date-fns"
import { useRouter } from "next/navigation"

export default function Calendar() {
   const router = useRouter()
   const store = useTattooProjects()
   const [date, setDate] = useState(new Date())

   const showPreviousMonth = () => setDate((prev) => subMonths(prev, 1))
   const showNextMonth = () => setDate((prev) => addMonths(prev, 1))

   function findDaySessions(date: Date) {
      const s = store.projects.reduce((acc, project) => {
         project.sessions.forEach((session) => {
            const { starts_at, ends_at } = session

            if (!isSameDay(starts_at, date)) return

            acc.push({
               customer_name: project.customer.name,
               session_start_at: session.starts_at,
               session_end_at: ends_at
            })
         })

         return acc
      }, [] as { customer_name: string, session_start_at: Date, session_end_at: Date }[])

      return s.sort((a, b) => a.session_start_at.getTime() - b.session_start_at.getTime())
   }

   return (
      <div className='flex px-8 py-4 size-full'>
         <DayPicker
            selected={new Date()}
            month={date}
            mode='single'
            onSelect={(_, date) => {
               if (!date) return
               router.push(`/calendar?day=${date.getDate()}&month=${date.getMonth()}&year=${date.getFullYear()}`)
            }}
            className="w-full flex-1 flex flex-col"
            classNames={{
               month_caption: 'text-center',
               nav: 'hidden flex items-center gap-2 pt-2 justify-between',
               months: 'flex flex-col flex-1 h-full w-full',
               month: 'flex flex-col flex-1 h-full w-full gap-4',
               month_grid: 'w-full h-full border-collapse gap-1 flex flex-col flex-1',
               weekdays: 'flex w-full justify-between',
               weekday: 'flex-1 text-center font-medium text-sm text-gray-400',
               weeks: 'w-full flex flex-col flex-1 gap-2 min-h-0',
               week: 'flex w-full flex-1 gap-2 min-h-0',
               day: 'flex-1 h-full min-h-0 p-0 text-center bg-black-secondary rounded-xl hover:bg-neutral-900 transition-colors overflow-hidden',
               outside: 'opacity-30',
               selected: 'outline outline-neutral-800'
            }}
            showOutsideDays
            components={{
               DayButton: (buttonProps) => (
                  <CalendarDayButton
                     {...buttonProps}
                     sessions={findDaySessions(buttonProps.day.date)}
                  />),
               CaptionLabel: (captionProps) => (
                  <CalendarHeader
                     {...captionProps}
                     date={date}
                     handlePreviousMonth={showPreviousMonth}
                     handleNextMonth={showNextMonth}
                  />
               ),
            }}
         />
      </div>
   )
}
