'use client'

import Customer from "@/domain/Customer";
import TattooProject, { TattooProjectObject } from "@/domain/TattooProject";
import TattooReference from "@/domain/TattooReference";
import TattooSession from "@/domain/TattooSession";
import React, { createContext, useContext, useState } from "react";

interface StoreState {
   projects: TattooProject[]
   setProjects: (projects: TattooProject[]) => void
   addProject: (project: TattooProject) => void
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

   function addProject(project: TattooProject) {
      setProjects((prev) => [...prev, project])
   }

   return (
      <TattooProjectsContext.Provider
         value={{
            projects,
            setProjects,
            addProject
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
