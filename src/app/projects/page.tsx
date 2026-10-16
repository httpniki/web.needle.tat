import NewProjectView from './_components/NewProjectView'
import ProjectsView from './_components/ProjectsView'
import ProjectView from './_components/ProjectView'

interface SearchParams {
   new?: 'true' | 'false'
   starts_date?: string
   ends_date?: string
   id?: string
   update?: 'true' | 'false'
}

interface Props {
   searchParams: Promise<SearchParams>
}

export default async function ProjectsPage(props: Props) {
   const paramsObj = await props.searchParams

   if (paramsObj.new === 'true') {
      return (
         <PageWrapper>
            <NewProjectView
               starts_date={paramsObj.starts_date ? new Date(paramsObj.starts_date) : undefined}
               ends_date={paramsObj.ends_date ? new Date(paramsObj.ends_date) : undefined}
            />
         </PageWrapper>
      )
   }

   if (paramsObj.id) {
      return (
         <PageWrapper>
            <ProjectView id={Number(paramsObj.id)} view={(paramsObj.update === 'true') ? 'Form' : 'Summary'} />
         </PageWrapper>
      )
   }

   return (
      <PageWrapper>
         <ProjectsView />
      </PageWrapper>
   )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
   return (
      <main className='h-max w-full p-4 md:px-8'>
         {children}
      </main>
   )
}
