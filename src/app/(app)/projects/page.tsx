import type { Metadata } from 'next'

import { getArtistOptions } from '@/actions/artist-actions'
import { getProject } from '@/actions/project-actions'
import { getCurrentArtist } from '@/lib/auth'

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

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
   const paramsObj = await searchParams

   if (paramsObj.new === 'true') return { title: 'Nuevo projecto - Needle.tat' }

   if (paramsObj.id) {
      try {
         const project = await getProject({ projectId: paramsObj.id })
         return { title: `${project.projectName || 'Proyecto'} - Needle.tat` }
      } catch {
         return { title: 'Proyecto - Needle.tat' }
      }
   }

   return { title: 'Projectos - Needle.tat' }
}

export default async function ProjectsPage(props: Props) {
   const paramsObj = await props.searchParams

   if (paramsObj.new === 'true') {
      const [artists, currentArtist] = await Promise.all([getArtistOptions(), getCurrentArtist()])
      const canAssignArtist = currentArtist?.app_metadata.role === 'owner'

      return (
         <PageWrapper>
            <NewProjectView
               artists={artists}
               canAssignArtist={canAssignArtist}
               starts_date={paramsObj.starts_date ? new Date(paramsObj.starts_date) : undefined}
               ends_date={paramsObj.ends_date ? new Date(paramsObj.ends_date) : undefined}
            />
         </PageWrapper>
      )
   }

   if (paramsObj.id) {
      const [artists, currentArtist] = await Promise.all([getArtistOptions(), getCurrentArtist()])
      const canAssignArtist = currentArtist?.app_metadata.role === 'owner'

      return (
         <PageWrapper>
            <ProjectView
               id={Number(paramsObj.id)}
               artists={artists}
               canAssignArtist={canAssignArtist}
               view={(paramsObj.update === 'true') ? 'Form' : 'Summary'}
            />
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
