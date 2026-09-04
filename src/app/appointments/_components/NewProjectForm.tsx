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

export default function NewProjectForm() {
   const store = useNewProject()
   const [pending, startTransition] = useTransition()
   const router = useRouter()
   const toast = useToast()

   const disableSubmit = (() => {
      let disabled = pending
      const emptyCustomer = new CustomerDomain()

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

      if (store.project.sessions.length === 0) disabled = true
      if (store.references.length === 0) disabled = true

      for (const key in store.customer) {
         const k = key as keyof typeof store.customer
         const v = store.customer[k]

         if (['id', 'username', 'email'].includes(k)) continue

         if (v === emptyCustomer[k]) disabled = true
      }

      return disabled
   })()

   async function submitForm() {
      const project = store.project.toObject()
      const customer = store.customer.toObject()
      const references = store.references

      startTransition(async () => {
         const result = await createProject(customer, project.sessions, references)
            .catch((err) => {
               console.error(err)
               toast.add({ message: 'Something went wrong creating the project', type: 'error', title: 'Unexpected error' })
            })

         if (result) {
            toast.add({ message: 'Nuevo projecto creado', type: 'success' })
            router.push('/')
         }
      })
   }

   return (
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
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

         {pending &&
            <div className='m-auto'>
               <Loader />
            </div>
         }

         {!pending &&
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
