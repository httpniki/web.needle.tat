import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { getCustomers } from '@/actions/customer-actions';
import { getInventory } from '@/actions/inventory-actions';

import Navbar from './_components/Navbar';
import NewAppointmentBtn from './_components/NewAppointmentBtn';
import Topbar from './_components/Topbar';
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
   title: 'Dashboard - Needle.tat'
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
   const [customers, inventory] = await Promise.all([getCustomers(), getInventory()])

   return (
      <html
         lang="en"
         className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
         <body className="flex h-full min-h-screen flex-col bg-black-primary font-sans text-white">
            <Topbar />

            <div className='flex size-full min-h-0 flex-1 flex-col-reverse md:flex-row'>
               <Navbar />

               <div className='relative flex size-full min-h-0 min-w-0 flex-1 overflow-y-auto'>
                  <ToastProvider>
                     <CustomersProvider customers={customers}>
                        <InventoryProvider inventory={inventory}>
                           {children}
                        </InventoryProvider>
                     </CustomersProvider>
                  </ToastProvider>

                  <NewAppointmentBtn />
               </div>
            </div>
         </body>
      </html>
   );
}
