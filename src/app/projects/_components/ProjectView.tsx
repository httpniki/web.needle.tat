'use client'

import { addHours } from 'date-fns';
import { useMemo, useState } from 'react';

import { updateCustomer as updateCustomerAction } from '@/actions/customer-actions';
import { updateProject } from '@/actions/project-actions';
import { createSession, deleteSession } from '@/actions/session-actions';
import { updateSession as updateSessionAction } from '@/actions/session-actions';
import { useCustomers, useProjects } from '@/app/_context/CustomersContext';
import { useToast } from '@/app/_context/ToastContext';
import CustomerDomain, { CustomerObject } from '@/domain/Customer';
import TattooProject from '@/domain/TattooProject';
import TattooReference, { TattooReferenceObject } from '@/domain/TattooReference';
import TattooSession, { Currency, SessionStatus, TattooSessionObject } from '@/domain/TattooSession';
import useDebounce from '@/hooks/useDebounce';
import { ClassProperties } from '@/types/types';
import DomainException from '@/utils/exceptions/domain-exception';
import { isKeyOf } from '@/utils/utils';

import Customer from './project/Customer';
import References from './project/References';
import Session from './project/Session';
import Sessions from './project/Sessions';
import ProjectNotFound from './ProjectNotFound';

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

type LoadingState = {
   customer: {
      [K in keyof Omit<CustomerObject, 'id'>]?: boolean
   }
   sessions: number[]
   references: { url: string }[]
}

interface Props {
   id: number
   view: 'Summary' | 'Form'
}

export default function ProjectView(props: Props) {
   const toast = useToast()
   const debounce = useDebounce(500)
   const { projects, calendar, addProject } = useProjects()
   const { findCustomerByProjectId, addCustomer } = useCustomers()
   const project = useMemo(() => projects.find((p) => p.id === props.id), [projects, props.id])
   const customer = project ? findCustomerByProjectId(project.id) : undefined

   const [errors, setErrors] = useState<ErrorState>({
      customer: {},
      project: {},
      sessions: []
   })

   const [loading, setLoading] = useState<LoadingState>({
      customer: {},
      sessions: [],
      references: []
   })

   function setSessionError(id: number, field: keyof typeof errors['sessions'][number], message: string) {
      let sessionErr = errors.sessions.find((s) => s.id === id)

      if (sessionErr) sessionErr[field as keyof Omit<typeof sessionErr, 'id'>] = message
      if (!sessionErr) sessionErr = { id, [field]: message }

      const updateSessions = errors.sessions.filter((s) => s.id !== id)
      updateSessions.push(sessionErr)

      setErrors({ ...errors, sessions: updateSessions })
   }

   function updateCustomer<K extends keyof Omit<CustomerObject, 'id'>>(key: K, value: NonNullable<CustomerObject[K]>) {
      if (!project || !customer) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      const customerCopy = customer.clone()

      try {
         switch (key) {
            case 'name':
               customerCopy.name = value as string
               break
            case 'username':
               customerCopy.username = value as string
               break
            case 'phone_number':
               customerCopy.phone_number = value as string
               break
            case 'email':
               customerCopy.email = value as string
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

      addCustomer(customerCopy)

      debounce(async () => {
         setLoading((p) => ({ ...p, customer: { [key]: true } }))

         await updateCustomerAction(customer.id, { [key]: value })
            .catch((error) => {
               if (error instanceof Error && error.name === 'no_changes') return
               toast.add({ title: 'Error', message: 'Error inesperado al actualizar el customer', type: 'error' })
            })
            .finally(() => setLoading((p) => ({ ...p, customer: { [key]: false } })))
      })
   }

   async function addSession(session: TattooSessionObject) {
      if (!project || !customer) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      const projectCopy = project.clone()
      const newSession = new TattooSession(session)
      let isSlotOccupied = calendar.isSlotOccupied(newSession.starts_at)

      while (isSlotOccupied) {
         newSession.starts_at = addHours(newSession.starts_at, 1)

         isSlotOccupied = calendar.isSlotOccupied(newSession.starts_at)
      }

      projectCopy.sessions.push(newSession)
      addProject(customer.id, projectCopy)

      setLoading((p) => {
         const sessions = p.sessions.filter(id => id !== newSession.id)
         return { ...p, sessions: [...sessions, newSession.id] }
      })

      try {
         const saved = await createSessionWithRetry(newSession, project.id)
         const savedSession = new TattooSession({ ...saved })

         projectCopy.sessions = projectCopy.sessions.map((s) => s.id === newSession.id ? savedSession : s)
         addProject(customer.id, projectCopy)
      } catch {
         addProject(customer.id, project)
         toast.add({ title: 'Error', message: 'Error inesperado al agregar la sesión', type: 'error' })
      } finally {
         setLoading((p) => ({ ...p, sessions: p.sessions.filter(id => id !== newSession.id) }))
      }
   }

   async function removeSession(id: number) {
      if (!project || !customer) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      const projectCopy = project.clone()
      const sessionsCopy = project.sessions

      projectCopy.sessions = projectCopy.sessions.filter((s) => s.id !== id)
      addProject(customer.id, projectCopy)

      setLoading((p) => {
         const sessions = p.sessions.filter(sessionId => sessionId !== id)
         return { ...p, sessions: [...sessions, id] }
      })

      await deleteSession(id)
         .catch(() => {
            projectCopy.sessions = sessionsCopy
            addProject(customer.id, projectCopy)

            toast.add({
               title: 'Error',
               message: 'Error inesperado al eliminar la sesión',
               type: 'error'
            })
         })
         .finally(() => setLoading((p) => ({ ...p, sessions: p.sessions.filter(sessionId => sessionId !== id) })))
   }

   async function updateSession(id: number, changes: Partial<Omit<TattooSessionObject, 'id'>>) {
      if (!project || !customer) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      const projectCopy = project.clone()
      const session = projectCopy.sessions.find((s) => s.id === id)

      if (!session) return toast.add({ title: 'Error', message: 'Sesión no encontrada', type: 'error' })
      const sessionClone = session.clone()

      try {
         for (const [key, value] of Object.entries(changes)) {
            switch (key) {
               case 'starts_at':
                  const newStartsAt = value as Date
                  session.starts_at = newStartsAt
                  break
               case 'ends_at':
                  const newEndsAt = value as Date
                  session.ends_at = newEndsAt
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
               case 'status':
                  session.status = value as SessionStatus
                  break
            }
         }
      } catch (error: unknown) {
         if (!(error instanceof DomainException)) return toast.add({ title: 'Error', message: 'Error inesperado al actualizar la sesión', type: 'error' })
         if (error instanceof DomainException) return setSessionError(id, error.field, error.message)
      }

      projectCopy.sessions = projectCopy.sessions.map(s => s.id === session.id ? session : s)
      addProject(customer.id, projectCopy)

      debounce(async () => {
         setLoading((p) => {
            const sessions = p.sessions.filter(sessionId => sessionId !== id)
            return { ...p, sessions: [...sessions, id] }
         })

         await updateSessionAction(session.toObject())
            .catch((error) => {
               if (error instanceof Error && error.name === 'no_changes') return

               toast.add({ title: 'Error', message: 'Error inesperado al actualizar la sesión', type: 'error' })

               projectCopy.sessions = projectCopy.sessions.map(s => s.id === session.id ? sessionClone : s)
               addProject(customer.id, projectCopy)
            })
            .finally(() => setLoading((p) => ({ ...p, sessions: p.sessions.filter(sessionId => sessionId !== id) })))
      })
   }

   async function addReference(reference: TattooReferenceObject) {
      if (!project || !customer) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })
      if (!reference.file) return toast.add({ title: 'Error', message: 'Archivo no encontrado', type: 'error' })

      const projectCopy = project.clone()
      const ref = new TattooReference(reference)
      projectCopy.references.push(ref)

      addProject(customer.id, projectCopy)
      setLoading((p) => ({
         ...p,
         references: p.references.filter((r) => r.url !== ref.url).concat({ url: ref.url })
      }))


      await updateProject(project.id, { addReferences: [reference.file] })
         .then((project) => {
            addProject(customer.id, project)
         })
         .catch((error) => {
            if (error instanceof Error && error.name === 'no_changes') return
            projectCopy.references = projectCopy.references.filter((r) => r.url !== ref.url)
            addProject(customer.id, projectCopy)
            toast.add({ title: 'Error', message: 'Error inesperado al agregar la referencia', type: 'error' })
         })
         .finally(() => setLoading((p) => ({ ...p, references: p.references.filter((r) => r.url !== ref.url) })))
   }

   async function removeReference(reference: TattooReferenceObject) {
      if (!project || !customer) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })
      if (!reference.url) return toast.add({ title: 'Error', message: 'URL no encontrada', type: 'error' })

      const projectCopy = project.clone()
      const ref = projectCopy.references.find((r) => r.url === reference.url)

      if (!ref) return toast.add({ title: 'Error', message: 'Referencia no encontrada', type: 'error' })

      projectCopy.references = projectCopy.references.filter((r) => r.url !== reference.url)
      setLoading((p) => ({
         ...p,
         references: p.references.filter((r) => r.url !== reference.url).concat({ url: ref.url })
      }))

      await updateProject(project.id, { removeReferences: [reference.url] })
         .then((project) => {
            addProject(customer.id, project)
         })
         .catch((error) => {
            if (error instanceof Error && error.name === 'no_changes') return
            projectCopy.references.push(ref)
            addProject(customer.id, projectCopy)
            toast.add({ title: 'Error', message: 'Error inesperado al eliminar la referencia', type: 'error' })
         })
         .finally(() => setLoading((p) => ({ ...p, references: p.references.filter((r) => r.url !== reference.url) })))
   }

   if (!project || !customer) return <ProjectNotFound />

   return (
      <form onSubmit={(e) => e.preventDefault()} className="flex size-full flex-1 flex-col gap-6">
         <div className='flex h-max w-full flex-col gap-6 xl:flex-row'>
            <Customer
               customer={customer}
               onChange={(key, value) => { updateCustomer(key, value) }}
               loading={loading.customer}
               enableEdit
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
               loading={loading.references.map((r) => r.url)}
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
                  loading={loading.sessions.includes(session.id)}
                  enableEdit
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
      </form>
   )
}

async function createSessionWithRetry(session: TattooSession, projectId: number): Promise<TattooSessionObject> {
   try {
      return await createSession({ ...session.toObject(), projectId })
   } catch (error) {
      if (!(error instanceof Error) || error.name !== 'session_time_conflict') throw error

      const shiftedSession = new TattooSession(session.toObject())
      shiftedSession.starts_at = addHours(shiftedSession.starts_at, 1)

      return createSessionWithRetry(shiftedSession, projectId)
   }
}
