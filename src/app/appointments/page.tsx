'use client'

import { useSearchParams } from "next/navigation"
import NewProjectForm from "./_components/NewProjectForm"
import Appointments from "./_components/AppointmentList"

export default function AppointmentsPage() {
   const searchParams = useSearchParams()

   return (
      <main>
         {searchParams.get('new') && <NewProjectForm />}
         {!searchParams.get('new') && <Appointments />}
      </main>
   )
}
