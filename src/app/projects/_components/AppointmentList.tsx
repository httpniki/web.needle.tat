'use client'

import { isToday, isTomorrow } from 'date-fns'
import Link from 'next/link'
import { useMemo } from 'react'

import { useTattooProjects } from '@/app/_context/TattooProjectsContext'
import SearchBar from '@/components/ui/SearchBar'
import Customer from '@/domain/Customer'
import TattooSession, { SessionStatus } from '@/domain/TattooSession'
import { formatPrice } from '@/utils/utils'

interface SessionWithCustomer {
   session: TattooSession
   customer: Customer
   project_id: number
}

interface GroupedDaySessions {
   date: Date
   sessions: SessionWithCustomer[]
}

export default function Appointments() {
   const { calendar, findProject } = useTattooProjects()

   const sessionsGrouped = useMemo<GroupedDaySessions[]>(() => {
      if (!calendar) return []

      return calendar.getSessionsGroupedByDay().map(({ date, sessions }) => {
         const sessionsWithCustomer = sessions
            .map((session) => {
               const project = findProject({ sessionId: session.id })

               if (!project) throw new Error(`No se encontró el proyecto con id ${session.id}`)

               return {
                  session,
                  customer: project.customer,
                  project_id: project.id
               }
            })
            .filter((item): item is SessionWithCustomer => item.customer !== undefined)

         return {
            date,
            sessions: sessionsWithCustomer
         }
      })
   }, [calendar])

   const today = new Date()
   today.setHours(0, 0, 0, 0)

   const pendingSessions = sessionsGrouped.filter(({ date }) => date >= today)
   const finishedSessions = sessionsGrouped.filter(({ date }) => date < today)

   return (
      <div>
         <SearchBar placeholder='Buscar...' />

         <ul className="mt-6 flex flex-col gap-6">
            {
               pendingSessions.map(({ date, sessions }) => {
                  if (date < today) return null

                  if (isToday(date))
                     return <AppointmentSection key={date.toString()} label='Turnos de hoy' items={sessions} date={date} />
                  if (isTomorrow(date))
                     return <AppointmentSection key={date.toString()} label='Turnos de mañana' items={sessions} date={date} />

                  return <AppointmentSection
                     key={date.toString()}
                     label={`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}
                     items={sessions}
                     date={date}
                  />
               })
            }

            {finishedSessions.length > 0 && <hr className='my-1 border-gray-primary' />}

            {
               finishedSessions.map(({ date, sessions }) => {
                  return (
                     <AppointmentSection
                        key={date.toString()}
                        label={`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}
                        items={sessions}
                        date={date}
                     />
                  )
               })
            }
         </ul>
      </div>
   )
}

interface AppointmentSectionProps {
   label: string
   items: SessionWithCustomer[]
   date: Date
}

export function AppointmentSection(props: AppointmentSectionProps) {
   const today = new Date()
   today.setHours(0, 0, 0, 0)

   return (
      <div className={'flex flex-col' + (props.date < today ? ' opacity-60' : '')}>
         <p className='font-bold'>{props.label}</p>

         {props.items.map(({ session, customer, project_id }, index) => (
            <AppointmentItem session={session} customer={customer} project_id={project_id} key={index} />
         ))}
      </div>
   )
}

function AppointmentItem({ session, customer, project_id }: SessionWithCustomer) {
   const starts_time = `${String(session.starts_at?.getHours()).padStart(2, '0')}:${String(session.starts_at?.getMinutes()).padStart(2, '0')}`
   const ends_time = `${String(session.ends_at?.getHours()).padStart(2, '0')}:${String(session.ends_at?.getMinutes()).padStart(2, '0')}`
   const total_price = formatPrice(session.price)
   const price = formatPrice(session.price - session.booking_fee)

   const today = new Date()
   today.setHours(0, 0, 0, 0)

   return (
      <li className='py-1 transition-colors duration-300 hover:bg-neutral-900/50'>
         <Link href={`/appointments/${project_id}`} className={'flex items-center justify-between gap-2 text-sm' + (session.starts_at < today ? ' text-gray-300' : '')}>
            <p className='flex w-full max-w-46 items-center'>
               <span>{starts_time} - {ends_time}</span>

               <span className={
                  'ml-2 px-1.5 py-0.5 rounded-xs text-sm font-regular' +
                  (session.status === SessionStatus.PENDING ? ' bg-gray-400' : '') +
                  (session.status === SessionStatus.IN_PROGRESS ? ' bg-orange-700' : '') +
                  (session.status === SessionStatus.CANCELED ? ' bg-red-800' : '') +
                  (session.status === SessionStatus.FINISHED ? ' bg-green-900' : '')
               }>
                  {session.status === SessionStatus.PENDING && 'Pendiente'}
                  {session.status === SessionStatus.IN_PROGRESS && 'En progreso'}
                  {session.status === SessionStatus.CANCELED && 'Cancelado'}
                  {session.status === SessionStatus.FINISHED && 'Finalizado'}
               </span>
            </p>

            <p className='flex-1 text-center'>{customer.name}</p>

            <p className='w-full max-w-46 text-end'>
               <span className={session.booking_fee !== 0 ? 'mr-1 text-red-400 line-through' : 'hidden'}>
                  ${total_price}
               </span>

               <span>
                  ${price}
               </span>
            </p>
         </Link>
      </li>
   )
}

