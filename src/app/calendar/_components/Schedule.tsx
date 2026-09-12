'use client'

import { useEffect, useMemo, useState } from 'react'
import { addDays, setHours } from 'date-fns'
import Customer from '@/domain/Customer'
import TattooSession from '@/domain/TattooSession'
import { useTattooProjects } from '@/app/_context/TattooProjectsContext'
import { useRouter } from 'next/navigation'
import ScheduleHeader from './schedule/ScheduleHeader'
import CellContentContent from './schedule/ScheduleCellContent'

export type Time = {
   hours: number
   minutes: number
}

export interface SelectedSessionItem {
   session?: TattooSession
   customer?: Customer
   selectedTime: Time
}

interface Props {
   day: number
   month: number
   year: number
}

const DAY_TIMES: Time[] = Array.from({ length: 19 }, (_, i) => ({
   hours: i + 6,
   minutes: 0
}))

function formatTime(time: Time): string {
   return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`
}

export default function Schedule(props: Props) {
   const store = useTattooProjects()
   const router = useRouter()

   const [isDragging, setIsDragging] = useState(false)
   const [selectedSlots, setSelectedSlots] = useState<SelectedSessionItem[]>([])
   const [date, setDate] = useState(new Date(props.year, props.month, props.day))

   const sessionsWithCustomer = useMemo(() => {
      const daySessions: TattooSession[] = store.calendar.getDaySessions(date)

      return daySessions.map((session) => {
         const project = store.findProject({ sessionId: session.id })

         if (!project) throw new Error(`Project with session ${session.id} not found`)

         return {
            session,
            customer: project.customer
         }
      })
   }, [store.projects, store.calendar, props.year, props.month, props.day, date])

   function isSlotSelected(time: Time): boolean {
      return selectedSlots.some((item) => item.selectedTime.hours === time.hours && item.selectedTime.minutes === time.minutes)
   }

   function findSessionByTime(time: Time) {
      const slotStart = date.getTime()
      const slotEnd = setHours(date, time.hours + 1).getTime()

      return sessionsWithCustomer.find(({ session }) => {
         const sStart = session.starts_at.getTime()
         const sEnd = session.ends_at.getTime()
         return sStart < slotEnd && sEnd > slotStart
      })
   }

   function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
      setIsDragging(true)

      if (!target || !target.dataset.hour || !target.dataset.minute) return

      const hour = Number(target.dataset.hour)
      const minute = Number(target.dataset.minute)
      const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)

      if (store.calendar.isSlotOccupied(newDate)) return

      const slotTime: Time = { hours: hour, minutes: minute }
      const match = findSessionByTime(slotTime)

      setSelectedSlots([
         {
            session: match?.session,
            customer: match?.customer,
            selectedTime: slotTime
         }
      ])
   }

   function onDrag(e: React.DragEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement

      if (!isDragging || !target) return

      const dataset = target.dataset
      if (!dataset.hour || !dataset.minute) return

      const hour = Number(dataset.hour)
      const minute = Number(dataset.minute)
      const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)

      if (store.calendar.isSlotOccupied(newDate)) return

      if (isSlotSelected({ hours: hour, minutes: minute })) return

      const currentIndex = DAY_TIMES.findIndex((t) => t.hours === hour && t.minutes === minute)
      if (currentIndex === -1) return

      const prevTime = DAY_TIMES[currentIndex - 1]
      const isPrevSelected = prevTime && isSlotSelected(prevTime)

      if (isPrevSelected) {
         const slotTime: Time = { hours: hour, minutes: minute }
         const match = findSessionByTime(slotTime)

         setSelectedSlots((prev) => [
            ...prev,
            {
               session: match?.session,
               customer: match?.customer,
               selectedTime: slotTime
            }
         ])
      }
   }

   const onMouseUp = () => setIsDragging(false)

   useEffect(() => {
      function onClickOnside(e: MouseEvent) {
         const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
         if (target.closest('.cell')) return

         setSelectedSlots([])
      }

      document.addEventListener('click', onClickOnside)
      return () => document.removeEventListener('click', onClickOnside)
   }, [selectedSlots])

   return (
      <div className="relative flex min-w-0 min-h-0 flex-1 overflow-hidden w-full">
         <div className="min-w-0 min-h-0 flex-1 overflow-auto w-full">
            <ScheduleHeader
               date={date}
               handlePrevious={() => setDate(addDays(date, -1))}
               handleNext={() => setDate(addDays(date, 1))}
               handleDate={() => router.push('/calendar')}
            />

            <div
               className="grid grid-cols-[80px_1fr] grid-rows-[auto] auto-rows-24 relative w-full text-center min-w-0 select-none border-x border-gray-primary mx-auto max-w-4xl"
               id='schedule'
               onDragStart={(e) => e.preventDefault()}
            >

               <div className="contents">
                  {DAY_TIMES.map((time, index) => {
                     const rowIndex = index + 2
                     const isSelected = isSlotSelected(time)
                     const timeLabel = formatTime(time)

                     return (
                        <div key={timeLabel} className="contents">
                           <time
                              dateTime={timeLabel}
                              style={{ gridRow: rowIndex, gridColumn: 1 }}
                              className="sticky left-0 z-10 bg-black-primary select-none flex items-center justify-center border-b border-r border-gray-primary text-sm text-gray-400"
                              draggable={false}
                           >
                              {timeLabel}
                           </time>

                           <div
                              style={{ gridRow: rowIndex, gridColumn: 2 }}
                              className={
                                 'cell border-b border-gray-primary touch-none transition-colors ' +
                                 (isSelected ? 'bg-neutral-900' : ' hover:bg-white/2')
                              }
                              data-hour={time.hours}
                              data-minute={time.minutes}
                              onMouseDown={onMouseDown}
                              onDrag={onDrag}
                              onMouseUp={onMouseUp}
                              onPointerDown={onMouseDown}
                              onPointerUp={onMouseUp}
                              onPointerMove={onDrag}
                           />
                        </div>
                     )
                  })}
               </div>

               {sessionsWithCustomer.map(({ session, customer }) => {
                  let startIndex = DAY_TIMES.findIndex((time) => {
                     const slotEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.hours + 1, time.minutes).getTime()
                     return session.starts_at.getTime() < slotEnd
                  })

                  if (startIndex === -1) startIndex = 0

                  let endIndex = DAY_TIMES.findIndex((time) => {
                     const slotStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.hours, time.minutes).getTime()
                     return slotStart >= session.ends_at.getTime()
                  })

                  if (endIndex === -1) endIndex = DAY_TIMES.length

                  const startRow = startIndex + 2
                  const endRow = endIndex + 2

                  return (
                     <CellContentContent
                        key={session.id}
                        sessionId={session.id}
                        sessionStatus={session.status}
                        customerName={customer?.name ?? ''}
                        customerUsername={customer?.username}
                        startsAt={session.starts_at}
                        endsAt={session.ends_at}
                        gridRow={`${startRow} / ${endRow}`}
                     />
                  )
               })}
            </div>
         </div>
      </div>
   )
}

