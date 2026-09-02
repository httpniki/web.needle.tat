import TattooProject from "@/domain/TattooProject"
import { create } from "zustand"

interface StoreState {
   projects: TattooProject[]
   setProjects: (projects: TattooProject[]) => void
}

export const useProjects = create<StoreState>((set) => ({
   projects: [],
   setProjects: (projects: TattooProject[]) => set({ projects }),
}))
