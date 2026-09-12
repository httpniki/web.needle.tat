'use client'

import React, { useEffect } from "react"
import { createPortal } from "react-dom"

interface Props {
   children: React.ReactNode
   onClickOutside: () => void
   className?: string
}

export default function RenderModal({ children, onClickOutside, className }: Props) {
   useEffect(() => {
      document.body.style.overflow = 'hidden'

      function handleClickOutside(event: MouseEvent) {
         const target = event.target as HTMLElement
         event.stopPropagation()
         if (target.matches('#modal')) onClickOutside()
      }

      document.addEventListener('mousedown', handleClickOutside)

      return () => {
         document.removeEventListener('mousedown', handleClickOutside)
         document.body.style.overflow = 'auto'
      }
   }, [onClickOutside])

   return createPortal(
      <div
         id='modal'
         className={"fixed flex items-center justify-center inset-0 z-10000 overflow-auto" +
            (className ? ` ${className}` : ' bg-black/80')
         }
      >
         {children}
      </div>,
      document.querySelector('body') as HTMLElement,
   )
}
