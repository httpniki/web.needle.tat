import { getCustomers } from '@/actions/customer-actions'
import { getInventory } from '@/actions/inventory-actions'
import AppShell from '@/app/_components/AppShell'
import NewAppointmentBtn from '@/app/_components/NewAppointmentBtn'
import CustomersProvider from '@/app/_context/CustomersContext'
import InventoryProvider from '@/app/_context/InventoryContext'
import ToastProvider from '@/app/_context/ToastContext'
import { requireArtist } from '@/lib/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
   await requireArtist()
   const [customers, inventory] = await Promise.all([getCustomers(), getInventory()])

   return (
      <AppShell>
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
