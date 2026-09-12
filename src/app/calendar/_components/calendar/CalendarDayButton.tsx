import { SessionStatus } from "@/domain/TattooSession"
import { DayButtonProps } from "@daypicker/react"

type Props = DayButtonProps & {
   sessions: {
      customer_name: string
      session_start_at: Date
      session_end_at: Date
      session_status: SessionStatus
   }[]
}

export default function CalendarDayButton(props: Props) {
   const { day, modifiers: _modifiers, sessions, ...buttonProps } = props

   return (
      <button
         {...buttonProps}
         className='cursor-pointer w-full h-full flex flex-col justify-start items-start p-2 md:p-3 outline-none overflow-hidden font-normal'
      >
         <span className={_modifiers.selected ? ' font-bold' : ''}>
            {day.date.getDate()}
         </span>

         <ul className='hidden lg:flex lg:flex-col gap-1 size-full'>
            {sessions.map((session) => {
               const startHours = session.session_start_at.getHours() < 10 ? '0' + session.session_start_at.getHours() : session.session_start_at.getHours()
               const startMinutes = session.session_start_at.getMinutes() < 10 ? '0' + session.session_start_at.getMinutes() : session.session_start_at.getMinutes()
               const endHours = session.session_end_at.getHours() < 10 ? '0' + session.session_end_at.getHours() : session.session_end_at.getHours()
               const endMinutes = session.session_end_at.getMinutes() < 10 ? '0' + session.session_end_at.getMinutes() : session.session_end_at.getMinutes()

               return (
                  <li key={session.session_start_at.toString()} className='flex flex-col 2xl:flex-row 2xl:gap-2 text-nowrap ellipsis w-full bg-white/5 rounded-md text-sm md:text-base'>
                     <span className='text-start'>
                        {startHours + ':' + startMinutes}
                        {' - '}
                        {endHours + ':' + endMinutes}
                     </span>

                     <span className='inline-block text-ellipsis max-w-32 lg:w-min overflow-hidden text-start'>
                        {session.customer_name}
                     </span>
                  </li>
               )
            })}
         </ul>

         <ul className='lg:hidden flex items-start justify-start gap-1 flex-wrap mt-1 overflow-hidden'>
            {sessions.map((session) => {
               return (
                  <li
                     key={session.session_start_at.toString()}
                     className={
                        'size-2 rounded-full' +
                        (session.session_status === SessionStatus.PENDING ? ' bg-gray-400' : '') +
                        (session.session_status === SessionStatus.IN_PROGRESS ? ' bg-orange-400' : '') +
                        (session.session_status === SessionStatus.FINISHED ? ' bg-green-400' : '') +
                        (session.session_status === SessionStatus.CANCELLED ? ' bg-red-400' : '')
                     }
                  />
               )
            })
            }
         </ul>
      </button>
   )
}

