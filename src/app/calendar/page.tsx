'use client'

import { getProjects } from "@/actions/project-actions"
import RenderModal from "@/components/RenderModal"
import Customer from "@/domain/Customer"
import TattooProject from "@/domain/TattooProject"
import TattooSession from "@/domain/TattooSession"
import { addMonths, isSameDay, subMonths } from "date-fns"
import { useEffect, useState, useTransition } from "react"
import Calendar from "./_components/Calendar"
import Loader from "@/components/ui/Loader"
import DayOverlay from "./_components/DayOverlay"
import TattooReference from "@/domain/TattooReference"

interface DaySession {
   customer_name: string
   session_start_at: Date
   session_end_at: Date
}

interface SelectedDayState {
   date: Date
   sessions: DaySession[]
}

export default function CalendarPage() {
   const [date, setDate] = useState(new Date())
   const [selectedDay, setSelectedDay] = useState<SelectedDayState | null>(null)
   const [loading, startTransition] = useTransition()
   const [projects, setProjects] = useState<TattooProject[]>([])

   useEffect(() => {
      startTransition(async () => {
         const projects = await getProjects()

         const parsedProjects: TattooProject[] = projects.map((p) => {
            const customer = new Customer({ ...p.customer })
            const sessions = p.sessions.map((s) => new TattooSession({ ...s }))
            const references = p.references.map((r) => new TattooReference({ ...r }))

            return new TattooProject({
               ...p,
               customer,
               sessions,
               references
            })
         })

         setProjects(parsedProjects)
      })
   }, [])

   const showPreviousMonth = () => setDate((prev) => subMonths(prev, 1));
   const showNextMonth = () => setDate((prev) => addMonths(prev, 1));

   function findDaySessions(date: Date) {
      const s = projects.reduce((acc, project) => {
         project.sessions.forEach((session) => {
            const { starts_at, ends_at } = session

            if (!isSameDay(starts_at, date)) return

            acc.push({
               customer_name: project.customer.name,
               session_start_at: session.starts_at,
               session_end_at: ends_at
            })
         })

         return acc
      }, [] as DaySession[])

      return s
   }

   return (
      <main className="size-full flex flex-1 flex-col">
         {loading && <span className='m-auto'><Loader /></span>}

         {!loading &&
            <Calendar
               date={date}
               onSelectDay={(date) => {
                  if (!date) return setSelectedDay(null)
                  setSelectedDay({ date, sessions: findDaySessions(date) })
               }}
               handlePreviousMonth={showPreviousMonth}
               handleNextMonth={showNextMonth}
               sessions={(date) => findDaySessions(date)}
            />
         }

         {(selectedDay) &&
            <RenderModal onClickOutside={() => setSelectedDay(null)}>
               <DayOverlay date={selectedDay.date} sessions={selectedDay.sessions} />
            </RenderModal>
         }
      </main>
   )
}
