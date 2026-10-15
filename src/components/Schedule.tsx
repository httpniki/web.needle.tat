'use client'

import { addDays, addHours } from 'date-fns'
import { useEffect, useState } from 'react'

import { useTattooProjects } from '@/app/_context/TattooProjectsContext'
import { CustomerObject } from '@/domain/Customer'
import { TattooSessionObject } from '@/domain/TattooSession'

import CellContentContent from './schedule/ScheduleCellContent'
import ScheduleHeader from './schedule/ScheduleHeader'

export type Time = {
   hours: number
   minutes: number
}

interface Props {
   date: Date
   onNextDay?: (date: Date) => void
   onPreviousDay?: (date: Date) => void
   onClickCaption?: () => void
   onSelectEnd?: (starts_at: Date, ends_at: Date) => void
   onRightClick?: (event: React.MouseEvent<HTMLButtonElement>, session_id: TattooSessionObject['id'], date: Date) => void
   sessions: ({
      session: Pick<TattooSessionObject, 'id' | 'starts_at' | 'ends_at' | 'status' | 'price' | 'currency' | 'booking_fee'>
      customer: Pick<CustomerObject, 'name' | 'username'>
      projectId: number
   })[]
}

const DAY_TIMES: Time[] = Array.from({ length: 19 }, (_, i) => ({
   hours: i + 6,
   minutes: 0
}))

function formatTime(time: Time): string {
   return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`
}

export default function Schedule(props: Props) {
   const [isDragging, setIsDragging] = useState(false)
   const [selectedSlots, setSelectedSlots] = useState<Time[]>([])

   const store = useTattooProjects()

   const nextDay = () => props.onNextDay?.(addDays(props.date, 1))
   const prevDay = () => props.onPreviousDay?.(addDays(props.date, -1))

   function selectSlot(time: Time) {
      return setSelectedSlots((prev) => {
         const isAlreadySelected = prev.some((item) => item.hours === time.hours && item.minutes === time.minutes)
         if (isAlreadySelected) return prev

         const currentIndex = DAY_TIMES.findIndex((t) => t.hours === time.hours && t.minutes === time.minutes)
         if (currentIndex === -1) return prev

         const prevTime = DAY_TIMES[currentIndex - 1]
         const isPrevSelected = prevTime && prev.some((item) => item.hours === prevTime.hours && item.minutes === prevTime.minutes)

         if (isPrevSelected) {
            return [...prev, { hours: time.hours, minutes: time.minutes }]
         }

         return prev
      })
   }

   function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
      setIsDragging(true)

      if (!target || !target.dataset.hour || !target.dataset.minute) return

      const hour = Number(target.dataset.hour)
      const minute = Number(target.dataset.minute)
      const newDate = new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), hour, minute)

      if (store.calendar.isSlotOccupied(newDate)) return

      setSelectedSlots([{
         hours: hour,
         minutes: minute
      }])
   }

   function onDrag(e: React.DragEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement

      if (!isDragging || !target) return

      const dataset = target.dataset
      if (!dataset.hour || !dataset.minute) return

      const hour = Number(dataset.hour)
      const minute = Number(dataset.minute)
      const newDate = new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), hour, minute)

      if (store.calendar.isSlotOccupied(newDate)) return

      const currentIndex = DAY_TIMES.findIndex((t) => t.hours === hour && t.minutes === minute)
      if (currentIndex === -1) return

      selectSlot({ hours: hour, minutes: minute })
   }

   function onMouseUp() {
      setIsDragging(false)
      if (selectedSlots.length === 0) return
      const starts_at = new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), selectedSlots[0].hours, selectedSlots[0].minutes)

      const ends_at = addHours(
         new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), selectedSlots[selectedSlots.length - 1].hours, selectedSlots[selectedSlots.length - 1].minutes),
         1
      )

      props.onSelectEnd?.(starts_at, ends_at)
   }

   useEffect(() => {
      function onClickOutside(e: MouseEvent) {
         const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
         if (target.closest('.cell') || target.closest('#context-menu')) return

         setSelectedSlots([])
      }

      function onKeyDown(e: KeyboardEvent) {
         switch (e.key) {
            case 'ArrowRight':
               nextDay()
               break
            case 'ArrowLeft':
               prevDay()
               break
            case 'Escape':
               props.onClickCaption?.()
               break
         }
      }

      document.addEventListener('click', onClickOutside)
      document.addEventListener('keydown', onKeyDown)
      return () => {
         document.removeEventListener('click', onClickOutside)
         document.removeEventListener('keydown', onKeyDown)
      }
   }, [selectedSlots, props.date])

   return (
      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
         <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto">
            <ScheduleHeader
               date={props.date}
               handlePrevious={prevDay}
               handleNext={nextDay}
               handleDate={() => props.onClickCaption?.()}
            />

            <div
               className="relative mx-auto grid w-full max-w-4xl min-w-0 auto-rows-24 grid-cols-[80px_1fr] grid-rows-[auto] border-x border-gray-primary text-center select-none"
               id='schedule'
               onDragStart={(e) => e.preventDefault()}
            >

               <div className="contents">
                  {DAY_TIMES.map((time, index) => {
                     const rowIndex = index + 2
                     const isSelected = selectedSlots.some((item) => item.hours === time.hours && item.minutes === time.minutes)
                     const timeLabel = formatTime(time)

                     return (
                        <div key={timeLabel} className="contents">
                           <time
                              dateTime={timeLabel}
                              style={{ gridRow: rowIndex, gridColumn: 1 }}
                              className="sticky left-0 z-10 flex items-center justify-center border-r border-b border-gray-primary bg-black-primary text-sm text-gray-400 select-none"
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

               {props.sessions.map(({ session, customer, ...rest }) => {
                  let startIndex = DAY_TIMES.findIndex((time) => {
                     const slotEnd = new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), time.hours + 1, time.minutes).getTime()
                     return session.starts_at.getTime() < slotEnd
                  })

                  if (startIndex === -1) startIndex = 0

                  let endIndex = DAY_TIMES.findIndex((time) => {
                     const slotStart = new Date(props.date.getFullYear(), props.date.getMonth(), props.date.getDate(), time.hours, time.minutes).getTime()
                     return slotStart >= session.ends_at.getTime()
                  })

                  if (endIndex === -1) endIndex = DAY_TIMES.length

                  const startRow = startIndex + 2
                  const endRow = endIndex + 2

                  return (
                     <CellContentContent
                        key={session.id}
                        gridRow={`${startRow} / ${endRow}`}
                        customer={{
                           name: customer.name,
                           username: customer.username
                        }}
                        onContextMenu={(e) => props.onRightClick?.(e, session.id, props.date)}
                        session={{
                           id: session.id,
                           projectId: rest.projectId,
                           status: session.status,
                           price: session.price,
                           bookingFee: session.booking_fee,
                           currency: session.currency,
                           startsAt: session.starts_at,
                           endsAt: session.ends_at
                        }}
                     />
                  )
               })}
            </div>
         </div>
      </div>
   )
}

