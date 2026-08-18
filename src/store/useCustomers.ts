import { Customer } from "@/types/types"
import { create } from "zustand"

const customers: Customer[] = [
   {
      id: '1',
      name: 'Nicolas',
      username: 'nicolas',
      phone_number: '+54 999 999 999',
   },
   {
      id: '2',
      name: 'Maria',
      username: 'maria',
      phone_number: '+54 999 999 999',
   },
   {
      id: '3',
      name: 'Juan',
      username: 'juan',
      phone_number: '+54 999 999 999',
   },
]

interface StoreState {
   customers: Customer[]
   setCustomers: (customers: Customer[]) => void
}

export const useCustomers = create<StoreState>((set) => ({
   customers,
   setCustomers: (customers: Customer[]) => set({ customers }),
}))
