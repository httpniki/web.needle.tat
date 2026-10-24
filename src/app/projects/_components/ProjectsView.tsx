'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { useCustomers, useProjects } from '@/app/_context/CustomersContext'
import SearchBar from '@/components/ui/SearchBar'

export default function ProjectsView() {
   const { projects } = useProjects()
   const { findCustomerByProjectId } = useCustomers()
   const router = useRouter()

   return (
      <article className='flex w-full flex-col gap-4'>
         <SearchBar placeholder='Buscar...' />

         <ul className="grid gap-2 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
            {projects.map(project => {
               const customer = findCustomerByProjectId(project.id)

               if (!customer) return null

               return (
               <li
                  className="group flex cursor-pointer flex-row overflow-hidden rounded-md border border-gray-primary bg-black-secondary shadow-lg transition-all hover:border-white/40 md:basis-[calc(50%-8px)] xl:basis-[calc(33.333%-8px)]"
                  key={project.id}
                  onClick={() => router.push(`/projects?id=${project.id}`)}
               >
                  <picture className="relative h-40 w-36 overflow-hidden bg-neutral-900">
                     <Image
                        width={160}
                        height={160}
                        src={project.references[0].url}
                        alt={`Proyecto de ${customer.name}`}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                     />
                  </picture>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
                     <div className="flex flex-col gap-1">
                        {project.projectName &&
                           <h3 className="min-w-0 truncate text-base font-semibold text-white">
                              {project.projectName}
                           </h3>
                        }

                        <section className="flex min-w-0 items-baseline justify-between gap-2">
                           <p
                              className="min-w-0 truncate text-sm text-white/60 transition-colors hover:opacity-80"
                              onClick={(event) => { event.stopPropagation(); router.push(`/customers/${customer.id}`) }}
                           >
                              {customer.name}
                           </p>

                           {customer.username &&
                              <p
                                 onClick={(event) => { event.stopPropagation(); router.push(`/customers/${customer.id}`) }}
                                 className="font-mono text-xs text-gray-500 transition-colors hover:opacity-80"
                              >
                                 @{customer.username}
                              </p>
                           }
                        </section>

                        <section className="flex items-center gap-2 text-xs text-gray-400">
                           <svg className="size-3.5 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                           </svg>

                           <p
                              className='text-nowrap transition-colors hover:opacity-80'
                              onClick={(event) => { event.stopPropagation(); router.push(`/customers/${customer.id}`) }}
                           >
                              {customer.phone_number || 'Sin teléfono registrado'}
                           </p>
                        </section>
                     </div>

                     <section className="flex flex-col items-start gap-3 border-t border-gray-primary/40 pt-2 text-xs sm:flex-row sm:items-center">
                        <div className="flex items-center gap-1.5 rounded-md border border-gray-primary/50 bg-neutral-900/80 px-2.5 py-1 text-gray-300">
                           <svg className="size-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                           </svg>

                           <p className='text-nowrap'>{project.sessions.length} {project.sessions.length === 1 ? 'Sesión' : 'Sesiones'}</p>
                        </div>

                        <div className="flex items-center gap-1.5 rounded-md border border-gray-primary/50 bg-neutral-900/80 px-2.5 py-1 text-gray-300">
                           <svg className="size-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </svg>

                           <p className='text-nowrap'>{project.references.length} {project.references.length === 1 ? 'Referencia' : 'Referencias'}</p>
                        </div>
                     </section>
                  </div>
               </li>
               )
            })}
         </ul>
      </article>
   )
}
