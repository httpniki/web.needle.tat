'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import AccountModal from './AccountModal'

export interface AccountSummary {
   email: string
   role: string
}

interface TopbarProps {
   hidden: boolean
   title: string
   account: AccountSummary
   onToggle: () => void
}

export default function Topbar({ hidden, title, account, onToggle }: TopbarProps) {
   const topbarRef = useRef<HTMLDivElement | null>(null)
   const [isAccountOpen, setIsAccountOpen] = useState({
      render: false,
      positionY: 0
   })

   useEffect(() => {
      if (!topbarRef) return
      const positionY = topbarRef.current?.getBoundingClientRect().top ?? 0
      const height = topbarRef.current?.getBoundingClientRect().height ?? 0

      setIsAccountOpen((prev) => ({
         ...prev,
         positionY: height + positionY
      }))

   }, [topbarRef])

   return (
      <div ref={topbarRef} className="sticky inset-x-0 top-0 z-10 flex min-w-0 items-center justify-start rounded-t-2xl border-b border-gray-primary bg-black-primary py-2 md:p-4">
         <Link href="/" className="flex cursor-pointer items-center gap-2 px-4 text-lg font-bold text-white transition-colors duration-200 hover:opacity-80 md:hidden md:py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 15 15">
               <path d="M0 0h15v15H0z" fill="none" />
               <path fill="currentColor" d="M8.55 2.03a3.006 3.006 0 0 1 4.19-.67c.23.17.28.48.11.7c-.16.23-.47.28-.69.11c-.9-.65-2.15-.45-2.8.45l5.26 3.82c.22.16.27.47.11.69c-.16.23-.47.28-.7.12l-.4-.3l-1.77 2.43l-.4-.3l-.59.81l.81.59c.22.16.27.48.11.7s-.47.27-.7.11L5.84 7.47l-.59.81l.4.29a.5.5 0 0 1 .11.7l-2.35 3.24c-.16.22-.47.27-.7.11l-.4-.3l-.59.81l-1.58 1.33l.77-1.91l.59-.81l-.41-.3a.506.506 0 0 1-.11-.7l2.36-3.23c.16-.23.47-.27.69-.11l.41.29l.59-.81l-1.62-1.17l-.3.4c-.16.22-.47.27-.69.11l-.81-.59a.48.48 0 0 1-.11-.69l1.17-1.62a.49.49 0 0 1 .7-.11l.81.58c.22.17.27.48.11.7L4 4.9l1.61 1.17l2.36-3.23l-.41-.3a.506.506 0 0 1-.11-.7c.16-.22.47-.27.7-.11zm.22 1.39L6.42 6.66l1.22.88l.58-.81l-.4-.29l1.76-2.43zm3.24 2.36l-.81-.59l-1.76 2.43l-.41-.3l-.58.81l1.61 1.18l.59-.81l-.4-.3z" />
            </svg>

            Needle.tat
         </Link>

         <button
            type='button'
            aria-label={hidden ? 'Mostrar navbar' : 'Ocultar navbar'}
            className="hidden cursor-pointer justify-center border-r border-gray-primary pr-4 transition-all duration-200 hover:opacity-80 md:flex"
            onClick={onToggle}
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

         <span className='hidden min-w-0 truncate pl-4 font-semibold md:block'>
            {title}
         </span>

         <button
            type='button'
            aria-label='Abrir mi cuenta'
            className='mr-4 ml-auto flex cursor-pointer items-center justify-center rounded-full border border-gray-primary p-2 text-white transition-colors hover:bg-gray-primary md:mr-0'
            onClick={() => setIsAccountOpen((prev) => ({ ...prev, render: true }))}
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" width="1.2em" height="1.2em">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
            </svg>
         </button>

         {isAccountOpen.render && (
            <AccountModal
               position={{
                  y: isAccountOpen.positionY,
                  x: 0
               }}
               email={account.email}
               role={account.role}
               onClose={() => setIsAccountOpen((prev) => ({ ...prev, render: false }))}
            />
         )}
      </div>
   )
}
