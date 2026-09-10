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
         className='cursor-pointer w-full h-full flex flex-col gap-0.5 justify-start items-start p-3 outline-none overflow-hidden font-normal'
      >
         <span className={_modifiers.selected ? ' font-bold' : ''}>
            {day.date.getDate()}
         </span>

         {sessions.map((session) => {
            const startHours = session.session_start_at.getHours() < 10 ? '0' + session.session_start_at.getHours() : session.session_start_at.getHours()
            const startMinutes = session.session_start_at.getMinutes() < 10 ? '0' + session.session_start_at.getMinutes() : session.session_start_at.getMinutes()
            const endHours = session.session_end_at.getHours() < 10 ? '0' + session.session_end_at.getHours() : session.session_end_at.getHours()
            const endMinutes = session.session_end_at.getMinutes() < 10 ? '0' + session.session_end_at.getMinutes() : session.session_end_at.getMinutes()

            return (
               <p key={session.session_start_at.toString()} className='flex flex-col xl:flex-row xl:gap-2 text-nowrap ellipsis w-full bg-white/5 rounded-md text-sm md:text-base'>
                  <span className='text-start'>
                     {startHours + ':' + startMinutes}
                     {' - '}
                     {endHours + ':' + endMinutes}
                  </span>

                  <span className='inline-block text-ellipsis max-w-32 lg:w-min overflow-hidden text-start'>
                     {session.customer_name}
                  </span>
               </p>
            )
         })}
      </button>
   )
}

