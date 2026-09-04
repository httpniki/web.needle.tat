import { DayButtonProps } from "@daypicker/react"

type Props = DayButtonProps & {
   sessions: {
      customer_name: string
      session_start_at: Date
      session_end_at: Date
   }[]
}

export default function CalendarDayButton(props: Props) {
   const { day, modifiers: _modifiers, sessions, ...buttonProps } = props

   return (
      <button
         {...buttonProps}
         className='cursor-pointer w-full h-full flex flex-col gap-0.5 justify-start items-start p-3 outline-none overflow-hidden'
      >
         {day.date.getDate()}

         {sessions.map((session) => {
            const startHours = session.session_start_at.getHours() < 10 ? '0' + session.session_start_at.getHours() : session.session_start_at.getHours()
            const startMinutes = session.session_start_at.getMinutes() < 10 ? '0' + session.session_start_at.getMinutes() : session.session_start_at.getMinutes()
            const endHours = session.session_end_at.getHours() < 10 ? '0' + session.session_end_at.getHours() : session.session_end_at.getHours()
            const endMinutes = session.session_end_at.getMinutes() < 10 ? '0' + session.session_end_at.getMinutes() : session.session_end_at.getMinutes()

            return (
               <p className='flex gap-2 justify-between text-start text-nowrap ellipsis w-full' key={session.session_start_at.toString()}>
                  <span>
                     {startHours + ':' + startMinutes}
                     {' - '}
                     {endHours + ':' + endMinutes}
                  </span>

                  <span className='inline-block text-ellipsis max-w-32 lg:w-min overflow-hidden'>
                     {session.customer_name}
                  </span>
               </p>
            )
         })}
      </button>
   )
}

