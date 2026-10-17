'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react';

export default function Navbar() {
   const [hidden, setHidden] = useState(false)

   return (
      <nav className={`sticky inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 border-t border-gray-primary bg-black-primary px-2 py-4 transition-all duration-300 ease-in-out md:inset-y-0 md:flex-col md:items-start md:justify-start md:border-t-0 md:border-r lg:left-0 ${hidden ? 'md:w-16' : 'md:w-52'}`}>
         <div className={`w-full ${hidden ? ' hidden items-center justify-center md:flex' : ' hidden justify-end md:flex'}`}>
            <button
               className="flex cursor-pointer justify-center p-1 transition-all duration-200 hover:opacity-80"
               onClick={() => setHidden((prev) => !prev)}
            >
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 24 24"
                  className={'transition-transform duration-300' + (hidden ? ' rotate-180' : '')}
               >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                     <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm11-2v16" />
                     <path d="m10 10l-2 2l2 2" />
                  </g>
               </svg>
            </button>
         </div>

         <NavItem
            href="/"
            hide={hidden}
            label="Inicio"
            icon={
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="1.4em" height="1.4em">
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
               </svg>
            }
         />

         <NavItem
            href="/calendar"
            hide={hidden}
            label="Calendario"
            icon={
               <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 36 36">
                  <path d="M0 0h36v36H0z" fill="none" />
                  <path fill="currentColor" d="M32 13.22V30H4V8h3V6H3.75A1.78 1.78 0 0 0 2 7.81v22.38A1.78 1.78 0 0 0 3.75 32h28.5A1.78 1.78 0 0 0 34 30.19V12.34a7.5 7.5 0 0 1-2 .88" />
                  <path fill="currentColor" d="M8 14h2v2H8z" />
                  <path fill="currentColor" d="M14 14h2v2h-2z" />
                  <path fill="currentColor" d="M20 14h2v2h-2z" />
                  <path fill="currentColor" d="M26 14h2v2h-2z" />
                  <path fill="currentColor" d="M8 19h2v2H8z" />
                  <path fill="currentColor" d="M14 19h2v2h-2z" />
                  <path fill="currentColor" d="M20 19h2v2h-2z" />
                  <path fill="currentColor" d="M26 19h2v2h-2z" />
                  <path fill="currentColor" d="M8 24h2v2H8z" />
                  <path fill="currentColor" d="M14 24h2v2h-2z" />
                  <path fill="currentColor" d="M20 24h2v2h-2z" />
                  <path fill="currentColor" d="M26 24h2v2h-2z" />
                  <path fill="currentColor" d="M10 10a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1" />
                  <path fill="currentColor" d="M22.5 6H13v2h9.78a7.5 7.5 0 0 1-.28-2" />
                  <circle cx="30" cy="6" r="5" fill="currentColor" />
                  <path fill="none" d="M0 0h36v36H0z" />
               </svg>
            }
         />

         <NavItem
            href="/appointments"
            hide={hidden}
            label="Turnos"
            icon={
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.2em"
                  height="1.2em"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path d="M3 5h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 19h.01" />
                  <path d="M8 5h13" />
                  <path d="M8 12h13" />
                  <path d="M8 19h13" />
               </svg>
            }
         />

         <NavItem
            href="/projects"
            hide={hidden}
            label="Projectos"
            icon={
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="1.2em"
                  height="1.2em"
               >
                  <path d="M20 20H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4.5a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z" />

                  <path d="M12 10v6" />
                  <path d="M9 13l3 3 3-3" />
               </svg>
            }
         />

         <NavItem
            href="/stock"
            hide={hidden}
            label="Stock"
            icon={
               <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 1024 1024">
                  <path d="M0 0h1024v1024H0z" fill="none" />
                  <path fill="currentColor" fillRule="evenodd" d="M160 144h304c8.837 0 16 7.163 16 16v304c0 8.837-7.163 16-16 16H160c-8.837 0-16-7.163-16-16V160c0-8.837 7.163-16 16-16m564.314-25.333l181.019 181.02c6.248 6.248 6.248 16.378 0 22.627l-181.02 181.019c-6.248 6.248-16.378 6.248-22.627 0l-181.019-181.02c-6.248-6.248-6.248-16.378 0-22.627l181.02-181.019c6.248-6.248 16.378-6.248 22.627 0M160 544h304c8.837 0 16 7.163 16 16v304c0 8.837-7.163 16-16 16H160c-8.837 0-16-7.163-16-16V560c0-8.837 7.163-16 16-16m400 0h304c8.837 0 16 7.163 16 16v304c0 8.837-7.163 16-16 16H560c-8.837 0-16-7.163-16-16V560c0-8.837 7.163-16 16-16" />
               </svg>
            }
         />
      </nav>
   )
}

interface NavItemProps {
   href: string
   icon: React.ReactNode
   label: string
   hide?: boolean
}

function NavItem({ href, icon, label, hide }: NavItemProps) {
   const router = useRouter()
   const pathname = usePathname()

   return (
      <button
         className={`flex h-min cursor-pointer items-center gap-2 rounded-sm py-1.5 text-white transition-colors duration-200 hover:bg-gray-primary hover:opacity-80 md:w-full ${hide ? 'items-center justify-center px-2' : 'px-4'} ${pathname === href ? 'bg-gray-primary font-bold' : 'font-medium'}`}
         onClick={() => router.push(href)}
      >
         {icon}

         <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${hide ? 'hidden max-w-0 opacity-0' : 'hidden max-w-xs opacity-100 md:inline-block'}`}>
            {label}
         </span>
      </button>
   )
}
