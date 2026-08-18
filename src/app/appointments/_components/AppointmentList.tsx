function AppointmentItem() {
   return (
      <li className="flex gap-2 items-center justify-between text-sm">
         <span>10:00hs - 12:00hs</span>
         <span>{'<cliente>'}</span>
         <button>${'<precio>'}</button>
      </li>
   )
}

export default function Appointments() {
   return (
      <ul className="flex flex-col gap-6">
         <div className='flex flex-col gap-3'>
            <p className='font-bold'>Turnos de hoy</p>

            {Array.from({ length: 3 }).map((_, index) => (
               <AppointmentItem key={index} />
            ))}
         </div>

         <div className='flex flex-col gap-3'>
            <p className='font-bold'>Turnos de mañana</p>

            {Array.from({ length: 2 }).map((_, index) => (
               <AppointmentItem key={index} />
            ))}
         </div>

         <div className='flex flex-col gap-3'>
            <p className='font-bold'>18/08/2026</p>

            {Array.from({ length: 2 }).map((_, index) => (
               <AppointmentItem key={index} />
            ))}
         </div>
      </ul>
   )
}
