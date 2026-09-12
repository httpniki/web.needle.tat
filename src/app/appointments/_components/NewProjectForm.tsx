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
            <h1 className="text-lg font-bold">Nuevo tatuaje</h1>

            <div className='flex gap-2 items-center'>
               <button
                  className='w-min enabled:cursor-pointer text-nowrap text-sm hover:opacity-80 disabled:opacity-25 border border-white/40 rounded-xs px-1.5 py-1.5'
                  onClick={() => router.back()}
                  disabled={pending}
               >
                  Cancelar
               </button>

               <button
                  className='w-min enabled:cursor-pointer text-nowrap text-sm hover:opacity-80 disabled:opacity-25 border border-white/40 rounded-xs px-1.5 py-1.5'
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
            <article className='flex gap-6 flex-col lg:flex-row justify-between items-start'>
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
