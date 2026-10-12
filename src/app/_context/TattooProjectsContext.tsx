'use client'

import React, { createContext, useContext, useMemo, useState } from 'react';

import { TattooCalendar } from '@/domain/calendar/Calendar';
import Customer from '@/domain/Customer';
import TattooProject, { TattooProjectObject } from '@/domain/TattooProject';
import TattooReference from '@/domain/TattooReference';
import TattooSession from '@/domain/TattooSession';

interface FindProjectParams {
   sessionId?: number
}

interface StoreState {
   projects: TattooProject[]
   setProjects: (projects: (TattooProject | TattooProjectObject)[]) => void
   addProject: (project: TattooProject | TattooProjectObject) => void
   findProject: (params: FindProjectParams) => TattooProject | undefined
   calendar: TattooCalendar
}

export const TattooProjectsContext = createContext<StoreState | null>(null)

interface Props {
   children: React.ReactNode
   projects: TattooProjectObject[]
}

export default function TattooProjectsProvider(props: Props) {
   const [projects, setProjects] = useState<TattooProject[]>(props.projects.map((p) => {
      const customer = new Customer({ ...p.customer })
      const sessions = p.sessions.map((s) => new TattooSession({ ...s }))
      const references = p.references.map((r) => new TattooReference({ ...r }))

      return new TattooProject({
         ...p,
         customer,
         sessions,
         references
      })
   }))

   const calendar = useMemo(() => {
      const tattooCalendar = new TattooCalendar()
      const allSessions = projects.flatMap((project) => project.sessions)

      tattooCalendar.addSessions(allSessions)

      return tattooCalendar
   }, [projects])

   function addProject(project: TattooProject | TattooProjectObject) {
      if (project instanceof TattooProject) {
         if (projects.some((p) => p.id === project.id)) {
            return setProjects((prev) => prev.map((p) => p.id === project.id ? project : p))
         }

         return setProjects((prev) => [...prev, project])
      }

      const customer = new Customer({ ...project.customer })
      const sessions = project.sessions.map((s) => new TattooSession({ ...s }))
      const references = project.references.map((r) => new TattooReference({ ...r }))
      const newProject = new TattooProject({ ...project, customer, sessions, references })

      if(projects.some((p) => p.id === newProject.id)) {
         return setProjects((prev) => prev.map((p) => p.id === newProject.id ? newProject : p))
      }

      setProjects((prev) => [...prev, newProject])
   }

   function findProject(params: FindProjectParams): TattooProject | undefined {
      const { sessionId } = params
      if (sessionId) return projects.find((p) => p.hasSession(sessionId))
   }

   function insertProjects(projects: (TattooProject | TattooProjectObject)[]) {
      setProjects(() => {
         return projects.map((p) => {
            if (p instanceof TattooProject) return p

            const customer = new Customer({ ...p.customer })
            const sessions = p.sessions.map((s) => new TattooSession({ ...s }))
            const references = p.references.map((r) => new TattooReference({ ...r }))

            return new TattooProject({ ...p, customer, sessions, references })
         })
      })
   }

   return (
      <TattooProjectsContext.Provider
         value={{
            projects,
            calendar,
            setProjects: insertProjects,
            addProject,
            findProject
         }}
      >
         {props.children}
      </TattooProjectsContext.Provider>
   )
}

export function useTattooProjects() {
   const context = useContext(TattooProjectsContext)
   if (!context) throw new Error('TattooProjectsContext not found')

   return context
}
