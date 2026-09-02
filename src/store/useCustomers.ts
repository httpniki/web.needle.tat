import Customer from "@/domain/Customer"
import { create } from "zustand"

const customers: Customer[] = []

interface StoreState {
   customers: Customer[]
   setCustomers: (customers: Customer[]) => void
}

export const useCustomers = create<StoreState>((set) => ({
   customers,
   setCustomers: (customers: Customer[]) => set({ customers }),
}))
