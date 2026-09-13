import { DayButtonProps } from '@daypicker/react'

import { SessionStatus } from '@/domain/TattooSession'

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
         className='flex size-full cursor-pointer flex-col items-start justify-start overflow-hidden p-2 font-normal outline-none md:p-3'
      >
         <span className={_modifiers.selected ? ' font-bold' : ''}>
            {day.date.getDate()}
         </span>

         <ul className='hidden size-full gap-1 lg:flex lg:flex-col'>
            {sessions.map((session) => {
               const startHours = session.session_start_at.getHours() < 10 ? '0' + session.session_start_at.getHours() : session.session_start_at.getHours()
               const startMinutes = session.session_start_at.getMinutes() < 10 ? '0' + session.session_start_at.getMinutes() : session.session_start_at.getMinutes()

               return (
                  <li key={session.session_start_at.toString()}
                     className={
                        'flex gap-1 2xl:gap-2 text-nowrap ellipsis w-full rounded-md text-sm md:text-base px-1' +
                        (session.session_status === SessionStatus.PENDING ? ' bg-gray-400' : '') +
                        (session.session_status === SessionStatus.IN_PROGRESS ? ' bg-orange-700' : '') +
                        (session.session_status === SessionStatus.CANCELED ? ' bg-red-800' : '') +
                        (session.session_status === SessionStatus.FINISHED ? ' bg-green-900' : '')
                     }
                  >
                     <span className='text-start'>
                        {startHours + ':' + startMinutes}
                     </span>

                     <span className='inline-block max-w-32 overflow-hidden text-start text-ellipsis lg:w-min'>
                        {session.customer_name}
                     </span>
                  </li>
               )
            })}
         </ul>

         <ul className='mt-1 flex w-full flex-wrap content-start gap-1 overflow-hidden lg:hidden'>
            {sessions.map((session) => {
               return (
                  <li
                     key={session.session_start_at.toString()}
                     className={
                        'size-2 rounded-full' +
                        (session.session_status === SessionStatus.PENDING ? ' bg-gray-400' : '') +
                        (session.session_status === SessionStatus.IN_PROGRESS ? ' bg-orange-600' : '') +
                        (session.session_status === SessionStatus.FINISHED ? ' bg-green-400' : '') +
                        (session.session_status === SessionStatus.CANCELED ? ' bg-red-800' : '')
                     }
                  />
               )
            })}
         </ul>
      </button>
   )
}

