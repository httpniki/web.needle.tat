import { getCustomers } from '@/actions/customer-actions'
import { getInventory } from '@/actions/inventory-actions'
import { requireArtist } from '@/lib/auth'

import AppShell from './_components/AppShell'
import NewAppointmentBtn from './_components/NewAppointmentBtn'
import CustomersProvider from './_context/CustomersContext'
import InventoryProvider from './_context/InventoryContext'
import ToastProvider from './_context/ToastContext'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
   const user = await requireArtist()
   const [customers, inventory] = await Promise.all([getCustomers(), getInventory()])

   return (
      <AppShell
         account={{
            email: user.email ?? 'Sin email',
            role: String(user.app_metadata.role ?? 'Sin rol')
         }}
      >
         <ToastProvider>
            <CustomersProvider customers={customers}>
               <InventoryProvider inventory={inventory}>
                  {children}
               </InventoryProvider>
            </CustomersProvider>
         </ToastProvider>

         <NewAppointmentBtn />
      </AppShell>
   )
}
