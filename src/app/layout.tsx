import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/Navbar";
import Topbar from "./_components/Topbar";
import NewAppointmentBtn from "./_components/NewAppointmentBtn";
import ToastProvider from "./_context/ToastContext"
import TattooProjectsProvider from "./_context/TattooProjectsContext"
import { getProjects } from "@/actions/project-actions";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
   const projects = await getProjects()

   return (
      <html
         lang="en"
         className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
         <body className="h-screen flex flex-col bg-black-primary font-sans text-white">
            <Topbar />

            <div className='flex min-h-0 flex-1 relative'>
               <ToastProvider>
                  <TattooProjectsProvider projects={projects}>
                     {children}
                  </TattooProjectsProvider>
               </ToastProvider>

               <NewAppointmentBtn />
            </div>

            <Navbar />
         </body>
      </html>
   );
}
