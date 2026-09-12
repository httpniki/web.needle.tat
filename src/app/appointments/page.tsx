import NewProjectForm from "./_components/NewProjectForm"
import Appointments from "./_components/AppointmentList"
import { NewProjectProvider } from "./_context/NewProjectContext"

interface SearchParams {
   new?: boolean
   starts_date?: string
   ends_date?: string
}

interface Props {
   searchParams: Promise<SearchParams>
}

export default async function AppointmentsPage({ searchParams }: Props) {
   const params = await searchParams

   return (
      <main className='w-full px-8 py-4 overflow-hidden overflow-y-auto'>
         {params.new &&
            <NewProjectProvider
               starts_date={params.starts_date ? new Date(params.starts_date) : undefined}
               ends_date={params.ends_date ? new Date(params.ends_date) : undefined}
            >
               <NewProjectForm />
            </NewProjectProvider>
         }
         {!params.new && <Appointments />}
      </main>
   )
}
