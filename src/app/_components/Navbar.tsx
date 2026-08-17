'use client'

import { usePathname, useRouter } from "next/navigation"

interface NavItemProps {
   href: string;
   children: React.ReactNode;
}

function NavItem({ href, children }: NavItemProps) {
   const router = useRouter()
   const pathname = usePathname()

   return (
      <button
         className={"flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors duration-200 hover:opacity-80 cursor-pointer" +
            (pathname === href ? " font-bold" : " font-medium")
         }
         onClick={() => router.push(href)}
      >
         {children}
      </button>
   )
}

export default function Navbar() {
   return (
      <div className="sticky bg-black-primary h-12 bottom-0 inset-x-0 z-10 flex items-center justify-center border-t border-gray-primary">
         <NavItem href="/">Panel</NavItem>
         <NavItem href="/calendar">Calendario</NavItem>
         <NavItem href="/appointments">Turnos</NavItem>
         <NavItem href="/stock">Stock</NavItem>
      </div>
   )
}
