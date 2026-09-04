import { DayPicker } from "@daypicker/react"
import CalendarHeader from "./CalendarHeader"
import CalendarDayButton from "./CalendarDayButton"

interface Props {
   sessions: (date: Date) => ({
      customer_name: string
      session_start_at: Date
      session_end_at: Date
   }[])
   date: Date
   onSelectDay: (date?: Date) => void
   handlePreviousMonth: () => void
   handleNextMonth: () => void
}

export default function Calendar(props: Props) {
   return (
      <DayPicker
         selected={props.date}
         month={props.date}
         mode='single'
         onSelect={(_, date) => props.onSelectDay(date)}
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
            selected: 'outline outline-white font-bold'
         }}
         showOutsideDays
         components={{
            DayButton: (buttonProps) => (
               <CalendarDayButton
                  {...buttonProps}
                  sessions={props.sessions(buttonProps.day.date)}
               />),
            CaptionLabel: (captionProps) => (
               <CalendarHeader
                  {...captionProps}
                  date={props.date}
                  handlePreviousMonth={props.handlePreviousMonth}
                  handleNextMonth={props.handleNextMonth}
               />
            ),
         }}
      />
   )
}
