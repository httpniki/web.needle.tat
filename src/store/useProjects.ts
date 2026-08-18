import { TattooProject } from "@/types/types"
import { create } from "zustand"

const projects: TattooProject[] = [
   {
      id: '1',
      client_id: '1',
      images: ['https://picsum.photos/id/100/200/300'],
      references: ['https://picsum.photos/id/100/200/300'],
      sessions: [
         {
            date: new Date(),
            time: 10,
            observations: 'Observaciones',
            status: 'PENDING',
            price: 10,
            currency: 'EUR',
         },
         {
            date: new Date(),
            time: 10,
            observations: 'Observaciones',
            status: 'PENDING',
            price: 10,
            currency: 'EUR',
         },
      ],
   },
   {
      id: '2',
      client_id: '2',
      images: ['https://picsum.photos/id/100/200/300'],
      references: ['https://picsum.photos/id/100/200/300'],
      sessions: [
         {
            date: new Date(),
            time: 10,
            observations: 'Observaciones',
            status: 'PENDING',
            price: 10,
            currency: 'EUR',
         },
         {
            date: new Date(),
            time: 10,
            observations: 'Observaciones',
            status: 'PENDING',
            price: 10,
            currency: 'EUR',
         },
      ],
   },
]

interface StoreState {
   projects: TattooProject[]
   setProjects: (projects: TattooProject[]) => void
}

export const useProjects = create<StoreState>((set) => ({
   projects,
   setProjects: (projects: TattooProject[]) => set({ projects }),
}))
