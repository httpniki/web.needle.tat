'use client'

import { isSameMonth } from 'date-fns'
import { ComponentProps, useState } from 'react'

import Calendar from '@/components/Calendar'
import RenderModal from '@/components/RenderModal'
import Schedule from '@/components/Schedule'
import SlotSelectionMenu from '@/components/schedule/SlotSelectionMenu'
import TattooSession, { SessionStatus } from '@/domain/TattooSession'

import { useTattooProjects } from '../_context/TattooProjectsContext'

export default function CalendarPage() {
   const [date, setDate] = useState<{ calendar: Date, schedule: Date, menu: { starts_at: Date, ends_at: Date } | null }>({
      calendar: new Date(),
      schedule: new Date(),
      menu: null
   })

   const [view, setView] = useState<'Calendar' | 'Schedule'>('Calendar')
   const store = useTattooProjects()

   function getDaySessions(date: Date): ComponentProps<typeof Schedule>['sessions'] {
      let daySessions: TattooSession[] = []

      try {
         daySessions = store.calendar.getDaySessions(date)
      } catch (_err: unknown) {
         daySessions = []
      }

      return daySessions.map((session) => {
         const project = store.findProject({ sessionId: session.id })

         if (!project) throw new Error(`Project with session ${session.id} not found`)

         return {
            session,
            customer: {
               name: project.customer.name,
               username: project.customer.username
            },
            projectId: project.id
         }
      })
   }

   function getMonthSessions(date: Date) {
      const s = store.projects.reduce((acc, project) => {
         project.sessions.forEach((session) => {
            const { starts_at, ends_at } = session

            if (!isSameMonth(starts_at, date)) return

            acc.push({
               customer_name: project.customer.name,
               session_start_at: session.starts_at,
               session_end_at: ends_at,
               session_status: session.status
            })
         })

         return acc
      }, [] as { customer_name: string, session_start_at: Date, session_end_at: Date, session_status: SessionStatus }[])

      return s.sort((a, b) => a.session_start_at.getTime() - b.session_start_at.getTime())
   }

   return (
      <main className="flex size-full min-h-0 flex-1 flex-row">
         {(view === 'Schedule') &&
            <Schedule
               sessions={getDaySessions(date.schedule)}
               date={date.schedule}
               onClickCaption={() => setView('Calendar')}
               onNextDay={(date) => setDate((prev) => ({ ...prev, schedule: date }))}
               onPreviousDay={(date) => setDate((prev) => ({ ...prev, schedule: date }))}
               onSelectEnd={(starts_at, ends_at) => {
                  setDate((prev) => ({
                     ...prev,
                     menu: {
                        starts_at,
                        ends_at
                     }
                  }))
               }}
            />
         }

         {(view === 'Schedule' && date.menu) &&
            <RenderModal onClickOutside={() => setDate((prev) => ({ ...prev, menu: null }))} className='slot-selection-menu bg-black/10'>
               <SlotSelectionMenu
                  starts_date={date.menu.starts_at}
                  ends_date={date.menu.ends_at}
               />
            </RenderModal>
         }

         <div className={'flex-1' + (view === 'Calendar' ? ' flex' : ' size-full max-h-124 max-w-124 hidden xl:flex')}>
            <Calendar
               sessions={getMonthSessions(date.calendar)}
               date={date.calendar}
               onNextMonth={(date) => setDate((prev) => ({ ...prev, calendar: date }))}
               onPreviousMonth={(date) => setDate((prev) => ({ ...prev, calendar: date }))}
               onClickDate={(date) => {
                  if (!date) return
                  setDate((prev) => ({ ...prev, schedule: date }))
                  setView('Schedule')
               }}
            />
         </div>
      </main>
   )
}
