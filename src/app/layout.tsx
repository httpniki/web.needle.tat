import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/Navbar";
import Topbar from "./_components/Topbar";
import NewAppointmentBtn from "./_components/NewAppointmentBtn";
import ToastProvider from "./_context/ToastContext"

const geistSans = Geist({
   variable: "--font-geist-sans",
   subsets: ["latin"],
});

const geistMono = Geist_Mono({
   variable: "--font-geist-mono",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Dashboard - Needle.tat"
};

export default function RootLayout({ children }: LayoutProps<"/">) {
   return (
      <html
         lang="en"
         className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
         <body className="h-full min-h-screen flex flex-col bg-black-primary font-sans text-white">
            <Topbar />

            <div className='relative flex-1 px-8 py-4'>
               <ToastProvider>
                  {children}
               </ToastProvider>

               <NewAppointmentBtn />
            </div>

            <Navbar />

         </body>
      </html>
   );
}
