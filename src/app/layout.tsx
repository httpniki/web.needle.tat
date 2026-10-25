import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { getCustomers } from '@/actions/customer-actions';
import { getInventory } from '@/actions/inventory-actions';

import AppShell from './_components/AppShell';
import NewAppointmentBtn from './_components/NewAppointmentBtn';
import CustomersProvider from './_context/CustomersContext'
import InventoryProvider from './_context/InventoryContext'
import ToastProvider from './_context/ToastContext'

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
});

export const metadata: Metadata = {
   title: 'Inicio - Needle.tat'
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
   const [customers, inventory] = await Promise.all([getCustomers(), getInventory()])

   return (
      <html
         lang="en"
         className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
         <body className="flex h-full min-h-screen flex-col font-sans text-white">
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
         </body>
      </html>
   );
}
