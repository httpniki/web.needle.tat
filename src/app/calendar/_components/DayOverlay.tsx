interface DaySession {
   customer_name: string
   session_start_at: Date
   session_end_at: Date
}

interface Props {
   date: Date
   sessions: DaySession[]
}

export default function DayOverlay(props: Props) {
   return (
      <div className="px-6 py-4 flex flex-col items-center gap-5 max-w-96 w-full bg-black-secondary rounded-xl">
         <p className='font-bold w-full text-center border-b border-gray-primary pb-2'>
            {props.date.toLocaleString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
         </p>

         <ul className='flex flex-col gap-2 w-full'>
            {props.sessions.length === 0 &&
               <li className='text-center text-gray-400'>No hay sesiones para esta fecha</li>
            }

            {props.sessions.map((session) => {
               const startHours = session.session_start_at.getHours() < 10 ? '0' + session.session_start_at.getHours() : session.session_start_at.getHours()
               const startMinutes = session.session_start_at.getMinutes() < 10 ? '0' + session.session_start_at.getMinutes() : session.session_start_at.getMinutes()
               const endHours = session.session_end_at.getHours() < 10 ? '0' + session.session_end_at.getHours() : session.session_end_at.getHours()
               const endMinutes = session.session_end_at.getMinutes() < 10 ? '0' + session.session_end_at.getMinutes() : session.session_end_at.getMinutes()

               return (
                  <li className='flex gap-2 justify-between text-start text-nowrap ellipsis w-full' key={session.session_start_at.toString()}>
                     <span>
                        {startHours + ':' + startMinutes}
                        {' - '}
                        {endHours + ':' + endMinutes}
                     </span>

                     <span>
                        {session.customer_name}
                     </span>
                  </li>
               )
            })}
         </ul>
      </div>
   )
}
