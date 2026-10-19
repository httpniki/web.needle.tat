'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useTattooProjects } from '@/app/_context/TattooProjectsContext'

export default function CustomerPage() {
   const params = useParams()
   const store = useTattooProjects()

   const projects = store.projects.filter((p) => String(p.customer.id) === params.customerId)
   const customer = projects[0]?.customer
   const sessionsCount = projects.reduce((acc, p) => acc + p.sessions.length, 0)
   const projectCount = projects.length

   if (!customer) return <div>No se encontró el cliente</div>

   return (
      <main className='w-full p-4 md:px-8'>
         <article>
            <header className='flex'>
               <section className='flex w-full items-center gap-8'>
                  <svg width="1.6em" height="1.6em" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7C15 5.34315 13.6569 4 12 4ZM7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7ZM12.0001 15C8.3441 15 5.5 17.7501 5.5 20.9999C5.5 21.5522 5.05228 21.9999 4.5 21.9999C3.94772 21.9999 3.5 21.5522 3.5 20.9999C3.5 16.5178 7.37176 13 12.0001 13C16.6283 13 20.5 16.5179 20.5 20.9999C20.5 21.5522 20.0523 21.9999 19.5 21.9999C18.9477 21.9999 18.5 21.5522 18.5 20.9999C18.5 17.7502 15.656 15 12.0001 15Z" fill="currentColor" />
                  </svg>

                  <div className='flex flex-col gap-1'>
                     <h1 className='text-lg font-bold'>{customer.name}</h1>

                     <p className='text-sm text-white/70'>
                        {customer.phone_number} · {customer.email ? customer.email : 'Sin email registrado'}
                     </p>
                  </div>
               </section>

               <button className='cursor-pointer hover:opacity-80'>
                  <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor" data-d-component="icon">
                     <path d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor" />
                  </svg>
               </button>
            </header>

            <hr className='my-6 border-gray-primary' />

            <section className='flex justify-between gap-8'>
               <div className='size-max'>
                  <p className='text-sm text-white/70'>Projectos</p>
                  <p>{projectCount}</p>
               </div>

               <div className='size-max'>
                  <p className='text-sm text-white/70'>Sesiones</p>
                  <p>{sessionsCount}</p>
               </div>

               <div className='size-max'>
                  <p className='text-sm text-white/70'>Próximo turno</p>
                  <p>21 oct.</p>
               </div>
            </section>

            <section className='mt-6'>
               <h2 className='mb-4 text-lg font-bold'>Projectos del cliente</h2>

               <ul className='flex flex-col gap-4'>
                  <li>
                     <TattooCard />
                  </li>

                  <li>
                     <TattooCard />
                  </li>
               </ul>
            </section>
         </article>
      </main>
   )
}

function TattooCard() {
   return (
      <div className='flex gap-4'>
         <div className='aspect-video h-33 w-23 rounded-xl bg-white' />

         <div className='flex w-full flex-col gap-1'>
            <div className='flex w-full items-center justify-between'>
               <h6 className='font-bold'>Rosa Minimalista</h6>

               <Link href={'/projects?id=1'} className='cursor-pointer pl-4 hover:opacity-80'>
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M8.293 4.293a1 1 0 0 1 1.414 0l7 7a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414-1.414L14.586 12 8.293 5.707a1 1 0 0 1 0-1.414Z" />
                  </svg>
               </Link>
            </div>

            <p className='truncate text-sm text-white/70'>
               Antebrazo izquierdo · 2 sesiones
            </p>

            <p className='truncate text-sm'>
               Completado
            </p>

            <p className='truncate text-xs text-white'>
               Última sesión: 21 oct. 2022
            </p>
         </div>
      </div>
   )
}
