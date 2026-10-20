'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

import { TattooCalendar } from '@/domain/calendar/Calendar'
import Customer, { CustomerObject } from '@/domain/Customer'
import TattooProject, { TattooProjectObject } from '@/domain/TattooProject'
import TattooReference from '@/domain/TattooReference'
import TattooSession from '@/domain/TattooSession'

type CustomerInput = Customer | CustomerObject
type ProjectInput = TattooProject | TattooProjectObject

interface FindProjectParams {
   sessionId?: number
   projectId?: number
}

interface CustomersStoreState {
   customers: Customer[]
   setCustomers: (customers: CustomerInput[]) => void
}

const CustomersContext = createContext<CustomersStoreState | null>(null)

interface Props {
   children: React.ReactNode
   customers: CustomerObject[]
}

function toProject(project: ProjectInput): TattooProject {
   if (project instanceof TattooProject) return project

   return new TattooProject({
      ...project,
      sessions: project.sessions.map((s) => new TattooSession({ ...s })),
      references: project.references.map((r) => new TattooReference({ ...r }))
   })
}

function toCustomer(customer: CustomerInput): Customer {
   if (customer instanceof Customer) return customer

   return new Customer({
      ...customer,
      tattooProjects: customer.tattooProjects.map(toProject)
   })
}

export default function CustomersProvider(props: Props) {
   const [customers, setCustomersState] = useState<Customer[]>(() => props.customers.map(toCustomer))

   function setCustomers(customers: CustomerInput[]) {
      setCustomersState(customers.map(toCustomer))
   }

   return (
      <CustomersContext.Provider value={{ customers, setCustomers }}>
         {props.children}
      </CustomersContext.Provider>
   )
}

function useCustomersContext(): CustomersStoreState {
   const context = useContext(CustomersContext)
   if (!context) throw new Error('CustomersContext not found')

   return context
}

export function useCustomers() {
   const { customers, setCustomers } = useCustomersContext()

   function addCustomer(customer: CustomerInput) {
      const newCustomer = toCustomer(customer)
      const exists = customers.some((c) => c.id === newCustomer.id)

      setCustomers(exists
         ? customers.map((c) => c.id === newCustomer.id ? newCustomer : c)
         : [...customers, newCustomer])
   }

   function findCustomer(id: number): Customer | undefined {
      return customers.find((c) => c.id === id)
   }

   function findCustomerByProjectId(projectId: number): Customer | undefined {
      return customers.find((c) => c.tattooProjects.some((p) => p.id === projectId))
   }

   return {
      customers,
      setCustomers,
      addCustomer,
      findCustomer,
      findCustomerByProjectId
   }
}

export function useProjects() {
   const { customers, setCustomers } = useCustomersContext()

   const projects = useMemo(() => customers.flatMap((customer) => customer.tattooProjects), [customers])

   const calendar = useMemo(() => {
      const tattooCalendar = new TattooCalendar()
      const allSessions = projects.flatMap((project) => project.sessions)

      tattooCalendar.addSessions(allSessions)

      return tattooCalendar
   }, [projects])

   function addProject(customerId: number, project: ProjectInput) {
      const newProject = toProject(project)

      setCustomers(customers.map((customer) => {
         if (customer.id !== customerId) return customer

         const customerCopy = customer.clone()
         const exists = customerCopy.tattooProjects.some((p) => p.id === newProject.id)

         customerCopy.tattooProjects = exists
            ? customerCopy.tattooProjects.map((p) => p.id === newProject.id ? newProject : p)
            : [...customerCopy.tattooProjects, newProject]

         return customerCopy
      }))
   }

   function getProjectsByCustomerId(customerId: number): TattooProject[] {
      return customers.find((customer) => customer.id === customerId)?.tattooProjects ?? []
   }

   function findProject(params: FindProjectParams): TattooProject | undefined {
      const { sessionId, projectId } = params

      if (projectId) return projects.find((p) => p.id === projectId)
      if (sessionId) return projects.find((p) => p.hasSession(sessionId))
   }

   return {
      projects,
      calendar,
      addProject,
      getProjectsByCustomerId,
      findProject
   }
}
