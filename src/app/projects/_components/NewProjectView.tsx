'use client'

import { addHours, setHours, setMinutes } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createProject } from '@/actions/project-actions'
import { useTattooProjects } from '@/app/_context/TattooProjectsContext'
import { useToast } from '@/app/_context/ToastContext'
import Loader from '@/components/ui/Loader'
import CustomerDomain, { CustomerObject } from '@/domain/Customer'
import TattooProject from '@/domain/TattooProject'
import TattooReference, { TattooReferenceObject } from '@/domain/TattooReference'
import TattooSession, { Currency, TattooSessionObject } from '@/domain/TattooSession'
import { ClassProperties } from '@/types/types'
import DomainException from '@/utils/exceptions/domain-exception'
import { isKeyOf } from '@/utils/utils'

import Customer from './project/Customer'
import References from './project/References'
import Session from './project/Session'
import Sessions from './project/Sessions'

type ErrorState = {
   customer: {
      [K in keyof Omit<ClassProperties<CustomerDomain>, 'id'>]?: string
   }
   project: {
      [K in keyof Omit<ClassProperties<TattooProject>, 'id' | 'sessions' | 'references'>]?: string
   }
   sessions: ({
      [K in keyof Omit<ClassProperties<TattooProject['sessions'][number]>, 'id'>]?: string
   } & { id: number })[]
   references?: string
}

interface Props {
   starts_date?: Date
   ends_date?: Date
}

export default function NewProjectView(props: Props) {
   const [project, setProject] = useState<TattooProject>(() => {
      const project = new TattooProject()
      const newSession = new TattooSession()

      newSession.id = 1

      if (props.starts_date) newSession.starts_at = props.starts_date
      if (props.ends_date) newSession.ends_at = props.ends_date

      project.sessions = [newSession]

      return project
   })

   const [errors, setErrors] = useState<ErrorState>({
      customer: {},
      project: {},
      sessions: []
   })

   const router = useRouter()
   const toast = useToast()
   const store = useTattooProjects()

   const [loading, startTransition] = useTransition()

   function setSessionError(id: number, field: keyof typeof errors['sessions'][number], message: string) {
      let sessionErr = errors.sessions.find((s) => s.id === id)

      if (sessionErr) sessionErr[field as keyof Omit<typeof sessionErr, 'id'>] = message
      if (!sessionErr) sessionErr = { id, [field]: message }

      const updateSessions = errors.sessions.filter((s) => s.id !== id)
      updateSessions.push(sessionErr)

      setErrors({ ...errors, sessions: updateSessions })
   }

   function updateCustomer<K extends keyof Omit<CustomerObject, 'id'>>(key: K, value: NonNullable<CustomerObject[K]>) {
      if (!project) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      const projectCopy = project.clone()

      if (projectCopy.customer.id) {
         const emptyCustomer = new CustomerDomain()
         projectCopy.customer = emptyCustomer
      }

      try {
         switch (key) {
            case 'name':
               projectCopy.customer.name = value
               break
            case 'username':
               projectCopy.customer.username = value
               break
            case 'phone_number':
               projectCopy.customer.phone_number = value
               break
            case 'email':
               projectCopy.customer.email = value
               break
         }
      } catch (error: unknown) {
         if (!(error instanceof DomainException)) return toast.add({ title: 'Error', message: 'Error inesperado al actualizar el cliente', type: 'error' })

         if (error instanceof DomainException && isKeyOf(error.field, errors.customer)) {
            const customerErrors = { ...errors.customer }
            customerErrors[error.field] = error.message
            setErrors({ ...errors, customer: customerErrors })
            return
         }
      }

      setProject(projectCopy)
   }

   function selectCustomer(customer: CustomerObject) {
      if (!project) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })
      if (!customer) return

      const projectCopy = project.clone()
      projectCopy.customer = new CustomerDomain(customer)

      setProject(projectCopy)
   }

   async function addSession(session: TattooSessionObject) {
      if (!project) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      const newSession = new TattooSession(session)
      const projectCopy = project.clone()

      let isSlotOcuppied = store.calendar.isSlotOccupied(session.starts_at)
      let isHourOcuppied = project.isHourOccupied(session.starts_at)

      while (isSlotOcuppied || isHourOcuppied) {
         const newStartsAt = addHours(newSession.starts_at, 1)
         newSession.starts_at = newStartsAt

         isSlotOcuppied = store.calendar.isSlotOccupied(newStartsAt)
         isHourOcuppied = projectCopy.isHourOccupied(newStartsAt)
      }

      projectCopy.sessions.push(newSession)
      setProject(projectCopy)
   }

   async function removeSession(id: number) {
      if (!project) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      const projectCopy = project.clone()
      projectCopy.sessions = projectCopy.sessions.filter((s) => s.id !== id)

      setProject(projectCopy)
      if (errors.sessions.some((e) => e.id === id)) setErrors({ ...errors, sessions: errors.sessions.filter((s) => s.id !== id) })
   }

   async function updateSession(id: number, changes: Partial<TattooSessionObject>) {
      if (!project) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      const projectCopy = project.clone()
      const session = projectCopy.sessions.find((s) => s.id === id)

      if (!session) return toast.add({ title: 'Error', message: 'Sesión no encontrada', type: 'error' })

      for (const [key, value] of Object.entries(changes)) {
         try {
            switch (key) {
               case 'date':
                  let newDate = value as Date
                  newDate = setHours(newDate, session.starts_at.getHours())
                  newDate = setMinutes(newDate, session.starts_at.getMinutes())
                  session.starts_at = newDate
                  break
               case 'starts_at':
                  session.starts_at = value as Date
                  break
               case 'ends_at':
                  session.ends_at = value as Date
                  break
               case 'observations':
                  session.observations = value as string
                  break
               case 'booking_fee':
                  session.booking_fee = value as number
                  break
               case 'price':
                  session.price = value as number
                  break
               case 'currency':
                  session.currency = value as Currency
                  break
            }
         } catch (error: unknown) {
            if (!(error instanceof DomainException)) return toast.add({ title: 'Error', message: 'Error inesperado al actualizar la sesión', type: 'error' })
            if (error instanceof DomainException) return setSessionError(id, error.field, error.message)
         }
      }

      projectCopy.sessions = projectCopy.sessions.map(s => s.id === session.id ? session : s)
      setProject(projectCopy)
   }

   async function addReference(reference: TattooReferenceObject) {
      if (!project) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })
      if (!reference.file) return toast.add({ title: 'Error', message: 'Archivo no encontrado', type: 'error' })

      const projectCopy = project.clone()
      const ref = new TattooReference(reference)

      projectCopy.references.push(ref)

      setProject(projectCopy)
   }

   async function removeReference(reference: TattooReferenceObject) {
      if (!project) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })
      if (!reference.url) return toast.add({ title: 'Error', message: 'URL no encontrada', type: 'error' })

      const projectCopy = project.clone()
      const ref = projectCopy.references.find((r) => r.url === reference.url)

      if (!ref) return toast.add({ title: 'Error', message: 'Referencia no encontrada', type: 'error' })

      projectCopy.references = projectCopy.references.filter((r) => r.url !== reference.url)
      setProject(projectCopy)
   }

   const disableSubmit = (() => {
      let disabled = false
      const emptyCustomer = new CustomerDomain()

      if (loading) disabled = true

      for (const key in errors) {
         const k = key as keyof typeof errors

         if (k === 'customer') {
            for (const key in errors.customer) {
               const k = key as keyof typeof errors.customer
               if (errors.customer[k]) disabled = true
            }
         }

         if (k === 'project') {
            for (const key in errors.project) {
               const k = key as keyof typeof errors.project
               if (errors.project[k]) disabled = true
            }
         }

         if (k === 'sessions') {
            errors.sessions.forEach((session) => {
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

         if (['_id', '_username', '_email'].includes(k)) continue

         if (v === emptyCustomer[k]) disabled = true
      }

      return disabled
   })()

   function submitForm() {
      if (disableSubmit) return

      startTransition(async () => {
         await createProject(project.toObject())
            .then((project) => store.addProject(project))
            .catch((err) => {
               if (err.name === 'session_time_conflict') {
                  return toast.add({ title: 'Error', message: 'La hora de inicio de la sesión ya está ocupada', type: 'error' })
               }
               toast.add({ title: 'Error', message: 'Error inesperado al agregar el proyecto', type: 'error' })
            })
      })
   }

   return (
      <form onSubmit={(e) => e.preventDefault()} className="flex w-full flex-col gap-6">
         <header className="flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-lg font-bold">
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.1em"
                  height="1.1em"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
               </svg>

               Nuevo projecto
            </h1>

            <div className='flex items-center gap-2'>
               <button
                  className='w-min rounded-xs border border-white/40 bg-gray-primary p-2 text-sm text-nowrap hover:opacity-80 enabled:cursor-pointer disabled:opacity-25'
                  onClick={() => router.back()}
                  disabled={loading}
               >
                  Cancelar
               </button>

               <button
                  className='w-min rounded-xs border border-white/40 bg-gray-primary p-2 text-sm text-nowrap hover:opacity-80 enabled:cursor-pointer disabled:opacity-25'
                  onClick={submitForm}
                  disabled={disableSubmit}
               >
                  Agregar
               </button>
            </div>
         </header>

         {(loading) && <Loader size='24px' className='mx-auto my-24' />}

         {(!loading) &&
            <>
               <div className='flex h-max w-full flex-col gap-6 xl:flex-row'>
                  <Customer
                     customer={project.customer}
                     onChange={(key, value) => { updateCustomer(key, value) }}
                     onSelectCustomer={(customer) => selectCustomer(customer)}
                     enableEdit={false}
                     enableCustomerSearch={true}
                     view='Input'
                     errors={Object.keys(errors.customer).map(key => {
                        const k = key as keyof typeof errors.customer
                        const v = errors.customer[k]

                        if (!v) return null

                        return { field: k, message: v }
                     }).filter(el => el !== null)}
                  />

                  <References
                     references={project.references}
                     onAddReference={(reference) => addReference(reference)}
                     onRemoveReference={(reference) => removeReference(reference)}
                     errors={errors.references}
                  />
               </div>

               <Sessions onAddSession={(session) => addSession(session)}>
                  {project.sessions.map((session, index) => (
                     <Session
                        key={session.id}
                        session={session}
                        index={index}
                        onDelete={(id) => removeSession(id)}
                        onChange={(changes) => updateSession(session.id, changes)}
                        enableEdit={false}
                        defaultView='Input'
                        errors={(errors.sessions.some(el => el.id === session.id))
                           ? Object.keys(errors.sessions.find(el => el.id === session.id) ?? {}).map(key => {
                              const k = key as keyof ErrorState['sessions'][number]
                              const v = errors.sessions.find(el => el.id === session.id)?.[k]

                              if (!v || k === 'id' || typeof v === 'number') return null

                              return { field: k, message: v }
                           }).filter(el => el !== null)
                           : []
                        }
                     />
                  ))}
               </Sessions>
            </>
         }
      </form>
   )
}
