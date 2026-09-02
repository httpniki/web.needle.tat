'use client'

import Customer from "@/domain/Customer"
import TattooProject from "@/domain/TattooProject"
import TattooSession from "@/domain/TattooSession"
import { ClassProperties } from "@/types/types"
import DomainException from "@/utils/exceptions/domain-exception"
import { isKeyOf } from "@/utils/utils"
import { createContext, useContext, useState } from "react"

type StoreState = {
   customer: Customer
   project: TattooProject
   references: File[]
   errors: ErrorState
}

type ErrorState = {
   customer: {
      [K in keyof Omit<ClassProperties<Customer>, 'id'>]?: string
   }
   project: {
      [K in keyof Omit<ClassProperties<TattooProject>, 'id' | 'sessions' | 'references'>]?: string
   }
   sessions: ({
      [K in keyof Omit<ClassProperties<TattooProject['sessions'][number]>, 'id'>]?: string
   } & { id: string })[]
   references?: string
}

interface StoreActions {
   updateCustomer: <K extends keyof Omit<ClassProperties<Customer>, 'id'>>(field: K, value: Customer[K]) => void
   addCustomer: (customer: Customer) => void
   updateSession: <K extends keyof Omit<ClassProperties<TattooSession>, 'id'>>(field: K, value: TattooSession[K], id: string) => void
   addNewSession: () => void
   removeSession: (id: string) => void
   addReference: (image: File) => void
   removeReference: (index: number) => void
}

type Store = StoreState & StoreActions

export const NewProjectContext = createContext<Store | null>(null)

export function NewProjectProvider({ children }: { children: React.ReactNode }) {
   const [project, setProject] = useState<TattooProject>(new TattooProject())
   const [customer, setCustomer] = useState<Customer>(new Customer())
   const [references, setReferences] = useState<File[]>([])

   const [errors, setErrors] = useState<ErrorState>({
      customer: {},
      project: {},
      sessions: []
   })

   if (project.sessions.length === 0) addNewSession()

   function setSessionError(id: string, field: keyof typeof errors['sessions'][number], message: string) {
      let sessionErr = errors.sessions.find((s) => s.id === id)

      if (sessionErr) sessionErr[field] = message
      if (!sessionErr) sessionErr = { id, [field]: message }

      const updateSessions = errors.sessions.filter((s) => s.id !== id)
      updateSessions.push(sessionErr)

      setErrors({ ...errors, sessions: updateSessions })
   }

   function updateCustomer<K extends Parameters<StoreActions['updateCustomer']>[0]>(field: K, value: Customer[K]) {
      try {
         const updatedCustomer = customer.clone()
         updatedCustomer[field] = value

         setCustomer(updatedCustomer)
         setErrors({ ...errors, customer: { ...errors.customer, [field]: '' } })
      } catch (error: unknown) {
         if (!(error instanceof DomainException)) throw error

         if (error instanceof DomainException && isKeyOf(error.field, errors.customer)) {
            const customerErrors = { ...errors.customer }
            customerErrors[error.field] = error.message
            setErrors({ ...errors, customer: customerErrors })
         }
      }
   }

   const addCustomer = (customer: Customer) => setCustomer(customer)

   function addNewSession() {
      const projectCopy = project.clone()
      const newSession = new TattooSession()

      newSession.id = crypto.randomUUID()
      projectCopy.sessions = [...projectCopy.sessions, newSession]

      setProject(projectCopy)
   }

   function updateSession<K extends keyof TattooSession>(field: K, value: TattooSession[K], id: string) {
      const projectCopy = project.clone()
      const session = projectCopy.sessions.find((session) => session.id === id)

      if (!session) throw new Error(`Session with id ${id} not found`)

      try {
         session[field] = value
         projectCopy.sessions = project.sessions.map((s) => s.id === id ? session : s)

         setProject(projectCopy)
      } catch (error: unknown) {
         if (!(error instanceof DomainException)) throw error
         if (error instanceof DomainException) setSessionError(id, error.field, error.message)
      }
   }

   function removeSession(id: string) {
      const projectCopy = project.clone()
      const updatedSessions = project.sessions.filter((data) => data.id !== id)
      projectCopy.sessions = updatedSessions

      setProject(projectCopy)
      if (errors.sessions.some((e) => e.id === id)) setErrors({ ...errors, sessions: errors.sessions.filter((s) => s.id !== id) })
   }

   const addReference = (image: File) => setReferences([...references, image])
   const removeReference = (index: number) => setReferences(references.filter((_, i) => i !== index))

   return (
      <NewProjectContext.Provider value={{
         customer,
         project,
         references,
         errors,
         updateCustomer,
         addCustomer,
         addNewSession,
         removeSession,
         updateSession,
         addReference,
         removeReference
      }}>
         {children}
      </NewProjectContext.Provider>
   )
}

export default function useNewProject() {
   const context = useContext(NewProjectContext)

   if (!context) throw new Error('NewProjectContext not found')

   return context
}
