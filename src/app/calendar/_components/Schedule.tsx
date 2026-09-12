'use client'

import { useEffect, useMemo, useState } from 'react'
import { addDays, addHours } from 'date-fns'
import TattooSession from '@/domain/TattooSession'
import { useTattooProjects } from '@/app/_context/TattooProjectsContext'
import { useRouter } from 'next/navigation'
import ScheduleHeader from './schedule/ScheduleHeader'
import CellContentContent from './schedule/ScheduleCellContent'
import SlotSelectionMenu from './schedule/SlotSelectionMenu'
import RenderModal from '@/components/RenderModal'

export type Time = {
   hours: number
   minutes: number
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
   const [date, setDate] = useState(new Date(props.year, props.month, props.day))
   const [selectedSlots, setSelectedSlots] = useState<Time[]>([])
   const [menu, setMenu] = useState(false)

   const sessionsWithCustomer = useMemo(() => {
      const daySessions: TattooSession[] = store.calendar.getDaySessions(date)

      return daySessions.map((session) => {
         const project = store.findProject({ sessionId: session.id })

         if (!project) throw new Error(`Project with session ${session.id} not found`)

         return {
            session,
            customer: project.customer,
            projectId: project.id
         }
      })
   }, [store.projects, store.calendar, props.year, props.month, props.day, date])

   function nextDay() {
      const newDate = addDays(date, 1)
      setDate(newDate)
      window.history.replaceState(null, '', `/calendar?day=${newDate.getDate()}&month=${newDate.getMonth()}&year=${newDate.getFullYear()}`)
   }

   function prevDay() {
      const newDate = addDays(date, -1)
      setDate(newDate)
      window.history.replaceState(null, '', `/calendar?day=${newDate.getDate()}&month=${newDate.getMonth()}&year=${newDate.getFullYear()}`)
   }

   const gotoCalendar = () => router.push('/calendar')
   const closeMenu = () => { setMenu(false); setSelectedSlots([]) }

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
      setMenu(false)

      if (!target || !target.dataset.hour || !target.dataset.minute) return

      const hour = Number(target.dataset.hour)
      const minute = Number(target.dataset.minute)
      const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)

      if (store.calendar.isSlotOccupied(newDate)) return

      setSelectedSlots([{
         hours: hour,
         minutes: minute
      }])
   }

   function onDrag(e: React.DragEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
      setMenu(false)

      if (!isDragging || !target) return

      const dataset = target.dataset
      if (!dataset.hour || !dataset.minute) return

      const hour = Number(dataset.hour)
      const minute = Number(dataset.minute)
      const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)

      if (store.calendar.isSlotOccupied(newDate)) return

      const currentIndex = DAY_TIMES.findIndex((t) => t.hours === hour && t.minutes === minute)
      if (currentIndex === -1) return

      selectSlot({ hours: hour, minutes: minute })
   }

   function onMouseUp() {
      setIsDragging(false)
      if (selectedSlots.length === 0) return
      setMenu(true)
   }

   useEffect(() => {
      function onClickOutside(e: MouseEvent) {
         const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
         if (target.closest('.cell') || target.closest('.slot-selection-menu')) return

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
               if (menu) {
                  closeMenu()
                  break
               }
               if (!menu) {
                  gotoCalendar()
                  break
               }
               break
         }
      }

      document.addEventListener('click', onClickOutside)
      document.addEventListener('keydown', onKeyDown)
      return () => {
         document.removeEventListener('click', onClickOutside)
         document.removeEventListener('keydown', onKeyDown)
      }
   }, [selectedSlots, date])

   return (
      <div className="relative flex min-w-0 min-h-0 flex-1 overflow-hidden w-full">
         <div className="min-w-0 min-h-0 flex-1 overflow-auto w-full">
            <ScheduleHeader
               date={date}
               handlePrevious={prevDay}
               handleNext={nextDay}
               handleDate={gotoCalendar}
            />

            <div
               className="grid grid-cols-[80px_1fr] grid-rows-[auto] auto-rows-24 relative w-full text-center min-w-0 select-none border-x border-gray-primary mx-auto max-w-4xl"
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

               {sessionsWithCustomer.map(({ session, customer, ...rest }) => {
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
                        gridRow={`${startRow} / ${endRow}`}
                        customer={{
                           name: customer.name,
                           username: customer.username
                        }}
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

         {(menu && selectedSlots.length > 0) &&
            <RenderModal onClickOutside={closeMenu} className='slot-selection-menu bg-black/10'>
               <SlotSelectionMenu
                  starts_date={new Date(date.getFullYear(), date.getMonth(), date.getDate(), selectedSlots[0].hours, selectedSlots[0].minutes)}
                  ends_date={addHours(new Date(date.getFullYear(), date.getMonth(), date.getDate(), selectedSlots[selectedSlots.length - 1].hours, selectedSlots[selectedSlots.length - 1].minutes), 1)}
               />
            </RenderModal>
         }
      </div>
   )
}

