'use client'

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react";

export default function Navbar() {
   const [hidden, setHidden] = useState(false)

   return (
      <nav className={`sticky bg-black-primary bottom-0 top-0 left-0 border-r border-gray-primary py-4 px-2 transition-all duration-300 ease-in-out flex flex-col gap-2 ${hidden ? 'w-16' : 'w-52'}`}>
         <div className={`flex w-full ${hidden ? 'justify-center' : 'justify-end'}`}>
            <button
               className="cursor-pointer hover:opacity-80 transition-all duration-200 p-1 flex justify-center"
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
            label="Panel"
            icon={
               <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="currentColor" d="M4 2H9C10.10457 2 11 2.89543 11 4V11C11 12.10457 10.10457 13 9 13H4C2.89543 13 2 12.10457 2 11V4C2 2.89543 2.89543 2 4 2ZM4 15H9C10.10457 15 11 15.89543 11 17V20C11 21.10457 10.10457 22 9 22H4C2.89543 22 2 21.10457 2 20V17C2 15.89543 2.89543 15 4 15ZM15 2H20C21.10457 2 22 2.89543 22 4V7C22 8.10457 21.10457 9 20 9H15C13.89543 9 13 8.10457 13 7V4C13 2.89543 13.89543 2 15 2ZM15 11H20C21.10457 11 22 11.89543 22 13V20C22 21.10457 21.10457 22 20 22H15C13.89543 22 13 21.10457 13 20V13C13 11.89543 13.89543 11 15 11Z" />
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
                  <path fill="currentColor" d="M32 13.22V30H4V8h3V6H3.75A1.78 1.78 0 0 0 2 7.81v22.38A1.78 1.78 0 0 0 3.75 32h28.5A1.78 1.78 0 0 0 34 30.19V12.34a7.5 7.5 0 0 1-2 .88" className="clr-i-outline--badged clr-i-outline-path-1--badged" />
                  <path fill="currentColor" d="M8 14h2v2H8z" className="clr-i-outline--badged clr-i-outline-path-2--badged" />
                  <path fill="currentColor" d="M14 14h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-3--badged" />
                  <path fill="currentColor" d="M20 14h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-4--badged" />
                  <path fill="currentColor" d="M26 14h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-5--badged" />
                  <path fill="currentColor" d="M8 19h2v2H8z" className="clr-i-outline--badged clr-i-outline-path-6--badged" />
                  <path fill="currentColor" d="M14 19h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-7--badged" />
                  <path fill="currentColor" d="M20 19h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-8--badged" />
                  <path fill="currentColor" d="M26 19h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-9--badged" />
                  <path fill="currentColor" d="M8 24h2v2H8z" className="clr-i-outline--badged clr-i-outline-path-10--badged" />
                  <path fill="currentColor" d="M14 24h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-11--badged" />
                  <path fill="currentColor" d="M20 24h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-12--badged" />
                  <path fill="currentColor" d="M26 24h2v2h-2z" className="clr-i-outline--badged clr-i-outline-path-13--badged" />
                  <path fill="currentColor" d="M10 10a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1" className="clr-i-outline--badged clr-i-outline-path-14--badged" />
                  <path fill="currentColor" d="M22.5 6H13v2h9.78a7.5 7.5 0 0 1-.28-2" className="clr-i-outline--badged clr-i-outline-path-15--badged" />
                  <circle cx="30" cy="6" r="5" fill="currentColor" className="clr-i-outline--badged clr-i-outline-path-16--badged clr-i-badge" />
                  <path fill="none" d="M0 0h36v36H0z" />
               </svg>
            }
         />

         <NavItem
            href="/appointments"
            hide={hidden}
            label="Turnos"
            icon={
               <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 1024 1024">
                  <path d="M0 0h1024v1024H0z" fill="none" />
                  <path fill="currentColor" d="M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8m0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8m0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8M104 228a56 56 0 1 0 112 0a56 56 0 1 0-112 0m0 284a56 56 0 1 0 112 0a56 56 0 1 0-112 0m0 284a56 56 0 1 0 112 0a56 56 0 1 0-112 0" />
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
         className={`flex items-center gap-2 py-2 text-white transition-colors duration-200 hover:opacity-80 cursor-pointer w-full h-min hover:bg-gray-primary rounded-sm ${hide ? 'items-center justify-center px-2' : 'px-4'} ${pathname === href ? 'font-bold' : 'font-medium'}`}
         onClick={() => router.push(href)}
      >
         {icon}

         <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${hide ? 'max-w-0 opacity-0 hidden' : 'max-w-xs opacity-100'}`}>
            {label}
         </span>
      </button>
   )
}
