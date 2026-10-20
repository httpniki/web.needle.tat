'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import SearchBar from '@/components/ui/SearchBar'
import Customer from '@/domain/Customer'

import { useTattooProjects } from '../_context/TattooProjectsContext'

export default function CustomerPage() {
   const store = useTattooProjects()

   const customers = useMemo(() => {
      const customers: Map<string, Customer> = new Map()

      store.projects.forEach((project) => {
         customers.set(project.customer.id, project.customer)
      })

      return Array.from(customers.values()).map((customer) => {
         return {
            id: customer.id,
            name: customer.name,
            phone_number: customer.phone_number,
            email: customer.email,
            projects: store.projects.filter((p) => p.customer.id === customer.id).length,
            sessions: store.projects.filter((p) => p.customer.id === customer.id).reduce((acc, p) => acc + p.sessions.length, 0)
         }
      })
   }, [store.projects])

   return (
      <main className='flex min-h-max w-full flex-col gap-4 p-4 md:px-8'>
         <SearchBar placeholder='Buscar cliente...' />

         <ul className='grid gap-2 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))]'>
            {customers.map((customer) => (
               <li key={customer.id}>
                  <CustomerCard
                     id={customer.id}
                     name={customer.name}
                     phone_number={customer.phone_number}
                     email={customer.email}
                     projects={customer.projects}
                     sessions={customer.sessions}
                  />
               </li>
            ))}
         </ul>
      </main>
   )
}

interface CustomerCardProps {
   id: string
   name: string
   phone_number: string
   email?: string
   projects: number
   sessions: number
}

function CustomerCard(props: CustomerCardProps) {
   return (
      <Link
         href={`/customers/${props.id}`}
         className='group flex size-full cursor-pointer flex-col justify-between rounded-md border border-gray-primary bg-black-secondary p-4 shadow-lg transition-all hover:border-white/40'
      >
         <div className='flex items-center justify-between'>
            <section className='flex min-w-0 items-center gap-3'>
               <div className='flex size-10 shrink-0 items-center justify-center rounded-full border border-gray-primary bg-neutral-900 text-white'>
                  <svg className='size-5' viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7C15 5.34315 13.6569 4 12 4ZM7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7ZM12.0001 15C8.3441 15 5.5 17.7501 5.5 20.9999C5.5 21.5522 5.05228 21.9999 4.5 21.9999C3.94772 21.9999 3.5 21.5522 3.5 20.9999C3.5 16.5178 7.37176 13 12.0001 13C16.6283 13 20.5 16.5179 20.5 20.9999C20.5 21.5522 20.0523 21.9999 19.5 21.9999C18.9477 21.9999 18.5 21.5522 18.5 20.9999C18.5 17.7502 15.656 15 12.0001 15Z" fill="currentColor" />
                  </svg>
               </div>

               <div className='flex min-w-0 flex-col gap-0.5'>
                  <h1 className='truncate text-base font-semibold text-white'>{props.name}</h1>

                  <p className='truncate text-xs text-gray-400'>
                     {props.phone_number}
                  </p>

                  <p className='truncate text-xs text-gray-400'>
                     {props.email ? props.email : 'Sin email registrado'}
                  </p>
               </div>
            </section>

            <svg className='size-5 shrink-0 text-gray-500 group-hover:opacity-80' fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
         </div>

         <section className='mt-4 flex items-center gap-2 border-t border-gray-primary/80 pt-4 text-xs text-gray-300'>
            <div className='flex items-center gap-1.5 rounded-md border border-gray-primary/50 bg-neutral-900/80 px-2.5 py-1.5'>
               <span className='font-mono font-semibold text-white'>{props.projects}</span>
               <span className='text-gray-400'>Proyectos</span>
            </div>

            <div className='flex items-center gap-1.5 rounded-md border border-gray-primary/50 bg-neutral-900/80 px-2.5 py-1.5'>
               <span className='font-mono font-semibold text-white'>{props.sessions}</span>
               <span className='text-gray-400'>Sesiones</span>
            </div>
         </section>
      </Link>
   )
}
