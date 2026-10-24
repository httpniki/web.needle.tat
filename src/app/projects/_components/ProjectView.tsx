'use client'

import { addHours } from 'date-fns'
import { useMemo, useState } from 'react'

import { getCustomers, updateCustomer as updateCustomerAction } from '@/actions/customer-actions'
import { updateProject } from '@/actions/project-actions'
import { createSession, deleteSession, updateSession as updateSessionAction } from '@/actions/session-actions'
import { useCustomers, useProjects } from '@/app/_context/CustomersContext'
import { useToast } from '@/app/_context/ToastContext'
import CustomerDomain, { CustomerObject } from '@/domain/Customer'
import TattooProject from '@/domain/TattooProject'
import TattooReference, { TattooReferenceObject } from '@/domain/TattooReference'
import TattooSession, { Currency, SessionStatus, TattooSessionObject } from '@/domain/TattooSession'
import { ClassProperties } from '@/types/types'
import DomainException from '@/utils/exceptions/domain-exception'
import { isKeyOf } from '@/utils/utils'

import Customer from './project/Customer'
import ProjectTitle from './project/ProjectTitle'
import References from './project/References'
import Session from './project/Session'
import Sessions from './project/Sessions'
import ProjectNotFound from './ProjectNotFound'

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
   id: number
   view: 'Summary' | 'Form'
}

export default function ProjectView(props: Props) {
   const toast = useToast()
   const { projects, calendar } = useProjects()
   const { findCustomerByProjectId, setCustomers } = useCustomers()

   const project = useMemo(() => projects.find((p) => p.id === props.id), [projects, props.id])
   const customer = project ? findCustomerByProjectId(project.id) : undefined

   const [draftProject, setDraftProject] = useState<TattooProject | null>(null)
   const [draftCustomer, setDraftCustomer] = useState<CustomerDomain | null>(null)

   const [isEditing, setIsEditing] = useState(false)
   const [isSaving, setIsSaving] = useState(false)

   const [errors, setErrors] = useState<ErrorState>({
      customer: {},
      project: {},
      sessions: []
   })

   const viewProject = draftProject ?? project
   const viewCustomer = draftCustomer ?? customer

   function setSessionError(id: number, field: keyof typeof errors['sessions'][number], message: string) {
      let sessionErr = errors.sessions.find((s) => s.id === id)

      if (sessionErr) sessionErr[field as keyof Omit<typeof sessionErr, 'id'>] = message
      if (!sessionErr) sessionErr = { id, [field]: message }

      const updateSessions = errors.sessions.filter((s) => s.id !== id)
      updateSessions.push(sessionErr)

      setErrors({ ...errors, sessions: updateSessions })
   }

   function startEditing() {
      if (!project || !customer) return toast.add({ title: 'Error', message: 'Proyecto no encontrado', type: 'error' })

      setDraftProject(project.clone())
      setDraftCustomer(customer.clone())
      setErrors({ customer: {}, project: {}, sessions: [] })
      setIsEditing(true)
   }

   function cancelEditing() {
      setDraftProject(null)
      setDraftCustomer(null)
      setErrors({ customer: {}, project: {}, sessions: [] })
      setIsEditing(false)
   }

   function updateProjectName(projectName: string) {
      if (!draftProject) return

      const projectCopy = draftProject.clone()
      projectCopy.projectName = projectName

      setDraftProject(projectCopy)
   }

   function updateCustomer<K extends keyof Omit<CustomerObject, 'id'>>(key: K, value: NonNullable<CustomerObject[K]>) {
      if (!draftCustomer) return

      const customerCopy = draftCustomer.clone()

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

      setDraftCustomer(customerCopy)
   }

   function addSession(session: TattooSessionObject) {
      if (!draftProject) return

      const projectCopy = draftProject.clone()
      const newSession = new TattooSession(session)

      while (calendar.isSlotOccupied(newSession.starts_at) || projectCopy.isHourOccupied(newSession.starts_at)) {
         newSession.starts_at = addHours(newSession.starts_at, 1)
      }

      projectCopy.sessions.push(newSession)
      setDraftProject(projectCopy)
   }

   function removeSession(id: number) {
      if (!draftProject) return

      const projectCopy = draftProject.clone()
      projectCopy.sessions = projectCopy.sessions.filter((s) => s.id !== id)

      setDraftProject(projectCopy)

      if (errors.sessions.some((e) => e.id === id)) {
         setErrors({ ...errors, sessions: errors.sessions.filter((s) => s.id !== id) })
      }
   }

   function updateSession(id: number, changes: Partial<Omit<TattooSessionObject, 'id'>>) {
      if (!draftProject) return

      const projectCopy = draftProject.clone()
      const session = projectCopy.sessions.find((s) => s.id === id)

      if (!session) return toast.add({ title: 'Error', message: 'Sesión no encontrada', type: 'error' })

      try {
         for (const [key, value] of Object.entries(changes)) {
            switch (key) {
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
      setDraftProject(projectCopy)
   }

   function addReference(reference: TattooReferenceObject) {
      if (!draftProject) return
      if (!reference.file) return toast.add({ title: 'Error', message: 'Archivo no encontrado', type: 'error' })

      const projectCopy = draftProject.clone()
      projectCopy.references.push(new TattooReference(reference))

      setDraftProject(projectCopy)
   }

   function removeReference(reference: TattooReferenceObject) {
      if (!draftProject) return
      if (!reference.url) return toast.add({ title: 'Error', message: 'URL no encontrada', type: 'error' })

      const projectCopy = draftProject.clone()

      if (!projectCopy.references.some((r) => r.url === reference.url)) {
         return toast.add({ title: 'Error', message: 'Referencia no encontrada', type: 'error' })
      }

      projectCopy.references = projectCopy.references.filter((r) => r.url !== reference.url)
      setDraftProject(projectCopy)
   }

   async function saveProject() {
      if (!project || !customer || !draftProject || !draftCustomer || isSaving) return

      setIsSaving(true)

      try {
         await updateCustomerAction(customer.id, draftCustomer.toObject())

         const originalReferenceUrls = new Set(project.references.map((ref) => ref.url))
         const draftReferenceUrls = new Set(draftProject.references.map((ref) => ref.url))
         const removeReferences = [...originalReferenceUrls].filter((url) => !draftReferenceUrls.has(url))
         const addReferences = draftProject.references
            .filter((ref) => !originalReferenceUrls.has(ref.url) && ref.file)
            .map((ref) => ref.file as File)

         const projectChanges: {
            projectName?: string
            removeReferences?: string[]
            addReferences?: File[]
         } = {}

         if (draftProject.projectName !== project.projectName) projectChanges.projectName = draftProject.projectName
         if (removeReferences.length > 0) projectChanges.removeReferences = removeReferences
         if (addReferences.length > 0) projectChanges.addReferences = addReferences
         if (Object.keys(projectChanges).length > 0) await updateProject(project.id, projectChanges)

         const originalSessionIds = new Set(project.sessions.map((session) => session.id))
         const draftSessionIds = new Set(draftProject.sessions.map((session) => session.id))
         const newSessions = draftProject.sessions.filter((session) => !originalSessionIds.has(session.id))
         const existingSessions = draftProject.sessions.filter((session) => originalSessionIds.has(session.id))
         const removedSessionIds = project.sessions
            .filter((session) => !draftSessionIds.has(session.id))
            .map((session) => session.id)

         for (const session of existingSessions) {
            const originalSession = project.sessions.find((s) => s.id === session.id)
            if (!originalSession) continue

            const sessionObject = session.toObject()
            if (JSON.stringify(sessionObject) === JSON.stringify(originalSession.toObject())) continue

            await updateSessionAction(sessionObject)
         }
         for (const session of newSessions) await createSessionWithRetry(session, project.id)
         for (const sessionId of removedSessionIds) await deleteSession(sessionId)

         setCustomers(await getCustomers())

         setDraftProject(null)
         setDraftCustomer(null)
         setErrors({ customer: {}, project: {}, sessions: [] })
         setIsEditing(false)
      } catch (error: unknown) {
         const message = error instanceof Error && error.name === 'session_time_conflict'
            ? 'La hora de inicio de la sesión ya está ocupada'
            : 'Error inesperado al actualizar el proyecto'

         toast.add({ title: 'Error', message, type: 'error' })
      } finally {
         setIsSaving(false)
      }
   }

   if (!project || !customer || !viewProject || !viewCustomer) return <ProjectNotFound />

   return (
      <form onSubmit={(e) => e.preventDefault()} className="flex size-full flex-1 flex-col gap-6">
         <header className='flex items-center justify-end gap-2'>
            {!isEditing &&
               <button
                  type='button'
                  className='w-min rounded-xs border border-white/40 bg-gray-primary p-2 text-sm text-nowrap hover:opacity-80 enabled:cursor-pointer disabled:opacity-25'
                  onClick={startEditing}
               >
                  Actualizar projecto
               </button>
            }

            {isEditing &&
               <>
                  <button
                     type='button'
                     className='w-min rounded-xs border border-white/40 bg-gray-primary p-2 text-sm text-nowrap hover:opacity-80 enabled:cursor-pointer disabled:opacity-25'
                     onClick={cancelEditing}
                     disabled={isSaving}
                  >
                     Cancelar
                  </button>

                  <button
                     type='button'
                     className='w-min rounded-xs border border-white/40 bg-gray-primary p-2 text-sm text-nowrap hover:opacity-80 enabled:cursor-pointer disabled:opacity-25'
                     onClick={saveProject}
                     disabled={isSaving}
                  >
                     {isSaving ? 'Guardando...' : 'Guardar projecto'}
                  </button>
               </>
            }
         </header>

         <ProjectTitle
            projectName={viewProject.projectName}
            defaultView={isEditing ? 'Input' : 'Summary'}
            onChange={updateProjectName}
         />

         <div className='flex h-max w-full flex-col gap-6 xl:flex-row'>
            <Customer
               customer={viewCustomer}
               onChange={(key, value) => { updateCustomer(key, value) }}
               enableEdit={isEditing}
               view={isEditing ? 'Input' : 'Summary'}
               errors={Object.keys(errors.customer).map(key => {
                  const k = key as keyof typeof errors.customer
                  const v = errors.customer[k]

                  if (!v) return null

                  return { field: k, message: v }
               }).filter(el => el !== null)}
            />

            <References
               references={viewProject.references}
               onAddReference={(reference) => addReference(reference)}
               onRemoveReference={(reference) => removeReference(reference)}
               errors={errors.references}
               enableEdit={isEditing}
            />
         </div>

         <Sessions onAddSession={(session) => addSession(session)} enableEdit={isEditing}>
            {viewProject.sessions.map((session, index) => (
               <Session
                  key={session.id}
                  session={session}
                  index={index}
                  onDelete={(id) => removeSession(id)}
                  onChange={(changes) => updateSession(session.id, changes)}
                  enableEdit={isEditing}
                  defaultView={isEditing ? 'Input' : 'Summary'}
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
