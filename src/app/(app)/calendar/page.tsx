'use client'

import { isSameMonth } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ComponentProps, useEffect, useState } from 'react'

import { updateSession } from '@/actions/session-actions'
import { usePageHeader } from '@/app/_components/AppShell'
import { useCustomers, useProjects } from '@/app/_context/CustomersContext'
import { useToast } from '@/app/_context/ToastContext'
import Calendar from '@/components/Calendar'
import Schedule from '@/components/Schedule'
import ContextMenu, { Button } from '@/components/ui/ContextMenu'
import TattooSession, { SessionStatus, TattooSessionObject } from '@/domain/TattooSession'

interface ContextMenu {
   position: { x: number, y: number }
   session_id?: TattooSessionObject['id']
   date?: { starts_at: Date, ends_at: Date }
}

export default function CalendarPage() {
   usePageHeader('Calendario')

   const { projects, calendar, addProject, findProject } = useProjects()
   const { findCustomerByProjectId } = useCustomers()
   const router = useRouter()
   const toast = useToast()

   const [view, setView] = useState<'Calendar' | 'Schedule'>('Calendar')
   const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
   const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
   const [date, setDate] = useState<{ calendar: Date, schedule: Date }>({
      calendar: new Date(),
      schedule: new Date(),
   })

   useEffect(() => {
      const onMouseMove = (event: MouseEvent) => {
         setMousePosition({
            x: event.clientX,
            y: event.clientY
         })
      }

      window.addEventListener('mousemove', onMouseMove)
      return () => window.removeEventListener('mousemove', onMouseMove)
   }, [])


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

   function getMonthSessions(date: Date) {
      const s = projects.reduce((acc, project) => {
         const customer = findCustomerByProjectId(project.id)

         if (!customer) return acc

         project.sessions.forEach((session) => {
            const { starts_at, ends_at } = session

            if (!isSameMonth(starts_at, date)) return

            acc.push({
               customer_name: customer.name,
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
                  setContextMenu({
                     position: { x: mousePosition.x, y: mousePosition.y },
                     date: { starts_at, ends_at }
                  })
               }}
               onRightClick={(event, session_id) => {
                  event.preventDefault()

                  setContextMenu({
                     position: { x: event.clientX, y: event.clientY },
                     session_id: session_id
                  })
               }}
            />
         }

         {(view === 'Schedule' && contextMenu && contextMenu.date) &&
            <ContextMenu
               positionX={contextMenu.position.x}
               positionY={contextMenu.position.y}
               onClickOutside={() => setContextMenu(null)}
            >
               <Button
                  onClick={() => {
                     if (!contextMenu.date) return
                     const url = `/projects?new=true&starts_date=${contextMenu.date.starts_at.toISOString()}&ends_date=${contextMenu.date.ends_at.toISOString()}`
                     router.push(url)
                  }}
               >
                  Añadir cita
               </Button>
            </ContextMenu>
         }

         {(view === 'Schedule' && contextMenu && contextMenu.session_id) &&
            <ContextMenu
               positionX={contextMenu.position.x}
               positionY={contextMenu.position.y}
               onClickOutside={() => setContextMenu(null)}
            >
               <Button
                  onClick={() => {
                     if (!contextMenu.session_id) throw new Error('No se encontró el id de la sesión')

                     const project_id = findProject({ sessionId: contextMenu.session_id })?.id
                     if (!project_id) throw new Error('No se encontró el id del proyecto')

                     router.push(`/projects?id=${project_id}`)
                  }}
               >
                  Modificar
               </Button>

               <Button
                  onClick={async () => {
                     const projectDomain = findProject({ sessionId: contextMenu.session_id })
                     const project = projectDomain?.toObject()
                     const session = project?.sessions.find((s) => s.id === contextMenu.session_id)

                     if (!contextMenu.session_id) return toast.add({ title: 'Error', message: 'No se encontró la sesión ' + contextMenu.session_id, type: 'error' })
                     if (!projectDomain) return toast.add({ title: 'Error', message: 'No se encontró el proyecto ' + contextMenu.session_id, type: 'error' })
                     if (!project) return toast.add({ title: 'Error', message: 'No se encontró el proyecto ' + contextMenu.session_id, type: 'error' })
                     if (!session) return toast.add({ title: 'Error', message: 'No se encontró la sesión ' + contextMenu.session_id, type: 'error' })

                     const customer = findCustomerByProjectId(projectDomain.id)

                     if (!customer) return toast.add({ title: 'Error', message: 'No se encontró el cliente del proyecto ' + projectDomain.id, type: 'error' })

                     switch (session.status) {
                        case SessionStatus.PENDING:
                           session.status = SessionStatus.CANCELED
                           break
                        case SessionStatus.IN_PROGRESS:
                           session.status = SessionStatus.FINISHED
                           break
                        case SessionStatus.FINISHED:
                           session.status = SessionStatus.CANCELED
                           break
                        case SessionStatus.CANCELED:
                           const now = new Date()
                           const inProgress = (session.starts_at <= now && session.ends_at > now)
                           const isPending = session.starts_at > now

                           if (inProgress) session.status = SessionStatus.IN_PROGRESS
                           else if (isPending) session.status = SessionStatus.PENDING
                           else session.status = SessionStatus.FINISHED
                           break
                     }

                     await updateSession(session)
                        .catch((error) => {
                           if (error instanceof Error && error.name === 'no_changes') return
                           toast.add({ title: 'Error', message: 'Error inesperado al actualizar la sesión', type: 'error' })
                        })

                     addProject(customer.id, project)
                  }}
               >
                  Cambiar estado
               </Button>
            </ContextMenu>
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
