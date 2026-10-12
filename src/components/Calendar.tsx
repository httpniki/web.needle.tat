'use client'

import { DayPicker } from '@daypicker/react'
import { addMonths, isSameDay, subMonths } from 'date-fns'
import { useEffect } from 'react'

import { SessionStatus } from '@/domain/TattooSession'

import CalendarDayButton from './calendar/CalendarDayButton'
import CalendarHeader from './calendar/CalendarHeader'

interface Props {
   onClickDate?: (date?: Date) => void
   date: Date
   onNextMonth?: (date: Date) => void
   onPreviousMonth?: (date: Date) => void
   sessions: {
      customer_name: string
      session_start_at: Date
      session_end_at: Date
      session_status: SessionStatus
   }[]
}

export default function Calendar(props: Props) {
   function showPreviousMonth() {
      const prevMonth = subMonths(props.date, 1)
      props.onPreviousMonth?.(prevMonth)
   }

   function showNextMonth() {
      const nextMonth = addMonths(props.date, 1)
      props.onNextMonth?.(nextMonth)
   }

   useEffect(() => {
      function onKeyDown(e: KeyboardEvent) {
         switch (e.key) {
            case 'ArrowLeft':
               showPreviousMonth()
               break
            case 'ArrowRight':
               showNextMonth()
               break
         }
      }

      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
   }, [props.date])

   return (
      <div className='flex size-full min-h-0 flex-1 flex-col px-8 py-4'>
         <DayPicker
            selected={new Date()}
            month={props.date}
            mode='single'
            onSelect={(_, date) => {
               if (!date) return
               props.onClickDate?.(date)
            }}
            className="flex min-h-0 w-full flex-1 flex-col"
            classNames={{
               month_caption: 'text-center',
               nav: 'hidden flex items-center gap-2 pt-2 justify-between',
               months: 'flex flex-col flex-1 h-full w-full min-h-0',
               month: 'flex flex-col flex-1 h-full w-full gap-4 min-h-0',
               month_grid: 'w-full h-full border-collapse gap-1 flex flex-col flex-1 min-h-0',
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
                     sessions={props.sessions.filter((session) => isSameDay(session.session_start_at, buttonProps.day.date))}
                     onClick={() => props.onClickDate?.(buttonProps.day.date)}
                  />),
               CaptionLabel: (captionProps) => (
                  <CalendarHeader
                     {...captionProps}
                     date={props.date}
                     handlePreviousMonth={showPreviousMonth}
                     handleNextMonth={showNextMonth}
                  />
               ),
            }}
         />
      </div>
   )
}
