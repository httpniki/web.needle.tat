import NewProjectForm from "./_components/NewProjectForm"
import Appointments from "./_components/AppointmentList"
import { NewProjectProvider } from "./_context/NewProjectContext"

interface Props {
   searchParams: Promise<{ new?: boolean }>
}

export default async function AppointmentsPage({ searchParams }: Props) {
   const { new: newAppointment } = await searchParams

   return (
      <main className='w-full px-8 py-4'>
         {newAppointment &&
            <NewProjectProvider>
               <NewProjectForm />
            </NewProjectProvider>
         }
         {!newAppointment && <Appointments />}
      </main>
   )
}
