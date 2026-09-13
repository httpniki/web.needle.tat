'use client'

import { useTransition } from "react"
import Customer from "./new-project/Customer"
import Sessions from "./new-project/Sessions"
import useNewProject from "../_context/NewProjectContext"
import References from "./new-project/References"
import Loader from "@/components/ui/Loader"
import { useRouter } from "next/navigation"
import { createProject } from "@/actions/project-actions"
import { useToast } from "@/app/_context/ToastContext"
import CustomerDomain from "@/domain/Customer"
import { useTattooProjects } from "@/app/_context/TattooProjectsContext"
import TattooProject from "@/domain/TattooProject"
import TattooSession from "@/domain/TattooSession"
import TattooReference from "@/domain/TattooReference"

export default function NewProjectForm() {
   const store = useNewProject()
   const projectsStore = useTattooProjects()
   const [pending, startTransition] = useTransition()
   const router = useRouter()
   const toast = useToast()

   const disableSubmit = (() => {
      let disabled = pending
      const emptyCustomer = new CustomerDomain()
      const project = store.project

      for (const key in store.errors) {
         const k = key as keyof typeof store.errors

         if (k === 'customer') {
            for (const key in store.errors.customer) {
               const k = key as keyof typeof store.errors.customer
               if (store.errors.customer[k]) disabled = true
            }
         }

         if (k === 'project') {
            for (const key in store.errors.project) {
               const k = key as keyof typeof store.errors.project
               if (store.errors.project[k]) disabled = true
            }
         }

         if (k === 'sessions') {
            store.errors.sessions.forEach((session) => {
               for (const key in session) {
                  if (key === 'id') continue
                  const k = key as keyof typeof session
                  if (session[k]) disabled = true
               }
            })
         }
      }

      if (project.sessions.length === 0) disabled = true
      if (project.references.length === 0) disabled = true

      for (const key in project.customer) {
         const k = key as keyof typeof project.customer
         const v = project.customer[k]

         if (['id', 'username', 'email'].includes(k)) continue

         if (v === emptyCustomer[k]) disabled = true
      }

      return disabled
   })()

   async function submitForm() {
      const customer = store.project.customer.toObject()
      const sessions = store.project.sessions.map((s) => s.toObject())
      const references = store.project.references.map((r) => {
         if (!r.file) throw new Error('File is null')
         return r.file
      })

      startTransition(async () => {
         const result = await createProject(customer, sessions, references)
            .catch((err) => {
               console.error(err)
               toast.add({ message: 'Something went wrong creating the project', type: 'error', title: 'Unexpected error' })
            })

         if (result) {
            const project = new TattooProject({
               ...result,
               customer: new CustomerDomain(result.customer),
               sessions: result.sessions.map((s) => new TattooSession(s)),
               references: result.references.map((r) => new TattooReference(r))
            })

            projectsStore.addProject(project)
            toast.add({ message: 'Nuevo projecto creado', type: 'success' })

            const calendarUrl = `/calendar?day=${project.sessions[0].starts_at.getDate()}&month=${project.sessions[0].starts_at.getMonth()}&year=${project.sessions[0].starts_at.getFullYear()}`
            router.push(calendarUrl)
         }
      })
   }

   return (
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col w-full gap-6">
         <header className="flex items-center justify-between">
            <h1 className="flex items-center gap-1 text-lg font-bold">
               <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 640 640">
                  <path d="M0 0h640v640H0z" fill="none" />
                  <path fill="currentColor" d="M535.6 85.7c-21.9-21.9-57.3-21.9-79.2 0L432 110.1l97.9 97.9l24.4-24.4c21.9-21.9 21.9-57.3 0-79.2zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L496 241.9L398.1 144zM160 128c-53 0-96 43-96 96v256c0 53 43 96 96 96h256c53 0 96-43 96-96v-96c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H160c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32z" />
               </svg>

               Nuevo tatuaje
            </h1>

            <div className='flex gap-2 items-center'>
               <button
                  className='w-min enabled:cursor-pointer text-nowrap text-sm hover:opacity-80 disabled:opacity-25 border border-white/40 rounded-xs px-2 py-2 bg-gray-primary'
                  onClick={() => router.back()}
                  disabled={pending}
               >
                  Cancelar
               </button>

               <button
                  className='w-min enabled:cursor-pointer text-nowrap text-sm hover:opacity-80 disabled:opacity-25 border border-white/40 bg-gray-primary rounded-xs px-2 py-2'
                  onClick={submitForm}
                  disabled={disableSubmit}
               >
                  Agregar
               </button>
            </div>
         </header>

         {(pending) &&
            <div className='m-auto'>
               <Loader className='-translate-y-full' />
            </div>
         }

         {(!pending) &&
            <article className='flex gap-6 flex-col 2xl:flex-row justify-between items-start'>
               <div className='flex flex-col gap-6 w-full'>
                  <Customer />
                  <References />
               </div>

               <Sessions />
            </article>
         }
      </form>
   )
}
