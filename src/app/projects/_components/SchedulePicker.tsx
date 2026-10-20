import { ComponentProps, useState } from 'react'

import { useCustomers, useProjects } from '@/app/_context/CustomersContext'
import Calendar from '@/components/Calendar'
import Schedule from '@/components/Schedule'
import TattooSession from '@/domain/TattooSession'

interface Props {
   onSelectAppointment?: (starts_at: Date, ends_at: Date) => void
   initialStartsAt?: Date
   initialEndsAt?: Date
   onClose?: () => void
}

export default function SchedulePicker(props: Props) {
   const [date, setDate] = useState(props?.initialStartsAt ?? new Date())
   const [view, setView] = useState<'Calendar' | 'Schedule'>('Calendar')

   const { calendar, findProject } = useProjects()
   const { findCustomerByProjectId } = useCustomers()

   function getDaySessions(date: Date): ComponentProps<typeof Schedule>['sessions'] {
      let daySessions: TattooSession[] = []

      try {
         daySessions = calendar.getDaySessions(date)
      } catch (_err: unknown) {
         daySessions = []
      }

      return daySessions.map((session) => {
         const project = findProject({ sessionId: session.id })

         if (!project) throw new Error(`Project with session ${session.id} not found`)

         const customer = findCustomerByProjectId(project.id)

         if (!customer) throw new Error(`Customer for project ${project.id} not found`)

         return {
            session,
            customer: {
               name: customer.name,
               username: customer.username
            },
            projectId: project.id
         }
      })
   }

   return (
      <div className='absolute right-0 flex size-full min-h-0 flex-1 animate-slide-in-right flex-col bg-black-primary md:max-w-120'>
         <header className="flex items-center justify-end p-2 md:py-6">
            <button
               className='cursor-pointer rounded-lg border border-gray-primary px-3 py-1.5 transition-opacity duration-200 hover:opacity-80'
               onClick={() => {
                  if (view === 'Schedule') return setView('Calendar')
                  props.onClose?.()
               }}
            >
               Volver
            </button>
         </header>

         {
            (view === 'Calendar') &&
            <div className='gap-6 rounded-lg md:max-h-200'>
               <Calendar
                  date={date}
                  onNextMonth={(date) => setDate(date)}
                  onPreviousMonth={(date) => setDate(date)}
                  onClickDate={(date) => {
                     if (!date) return
                     setDate(date)
                     setView('Schedule')
                  }}
                  sessions={[]}
               />
            </div>
         }

         {
            (view === 'Schedule') &&
            <Schedule
               date={date}
               sessions={getDaySessions(date)}
               onClickCaption={() => setView('Calendar')}
               onNextDay={(date) => setDate(date)}
               onPreviousDay={(date) => setDate(date)}
               onSelectEnd={(starts_at, ends_at) => {
                  props.onSelectAppointment?.(starts_at, ends_at)
               }}
            />
         }
      </div>
   )
}
