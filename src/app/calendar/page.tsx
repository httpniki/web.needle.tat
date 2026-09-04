'use client'

import { getCustomers } from "@/actions/customer-actions"
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
   const [customers, setCustomers] = useState<Customer[]>([])

   useEffect(() => {
      startTransition(async () => {
         const projects = await getProjects()

         const parsedProjects: TattooProject[] = projects.map((p) => {
            const sessions = p.sessions.map((s) => {
               const session: TattooSession = new TattooSession({
                  id: s.id,
                  starts_at: new Date(s.starts_at),
                  ends_at: new Date(s.ends_at),
                  observations: s.observations ?? '',
                  status: s.status,
                  price: s.price,
                  currency: s.currency
               })

               return session
            })

            const project: TattooProject = new TattooProject({
               id: p.id,
               customer_id: p.customer_id,
               images: p.images,
               references: p.references,
               sessions: sessions,
               observations: p.observations
            })

            return project
         })

         setProjects(parsedProjects)
         const customers = await getCustomers()

         const parsedCustomers: Customer[] = customers.map((c) => {
            const customer = new Customer({
               id: c.id,
               name: c.name,
               username: c.username,
               phone_number: c.phone_number,
               email: c.email
            })

            return customer
         })

         setCustomers(parsedCustomers)
      })
   }, [])

   const showPreviousMonth = () => setDate((prev) => subMonths(prev, 1));
   const showNextMonth = () => setDate((prev) => addMonths(prev, 1));

   function findDaySessions(date: Date) {
      const s = projects.reduce((acc, project) => {
         const customer = customers.find((c) => c.id === project.customer_id)

         if (!customer) throw new Error('Customer not found')

         for (const session in project.sessions) {
            const { starts_at, ends_at } = project.sessions[session]

            if (!isSameDay(starts_at, date)) continue

            acc.push({
               customer_name: customer.name,
               session_start_at: starts_at,
               session_end_at: ends_at
            })
         }

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
