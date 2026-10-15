import { useEffect, useState } from 'react'

import RenderModal from '@/components/RenderModal'

interface Props {
   positionX: number
   positionY: number
   children: React.ReactNode
   onClickOutside?: () => void
}

export default function ContextMenu(props: Props) {
   const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

   useEffect(() => {
      const onResize = () => setIsDesktop(window.innerWidth >= 768)

      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
   }, [])

   return (
      <RenderModal
         onClickOutside={() => props.onClickOutside?.()}
         className='md:bg-black/0'
      >
         <div
            id='context-menu'
            style={isDesktop ? { left: props.positionX, top: props.positionY } : undefined}
            className={'absolute inset-x-0 bottom-0 flex flex-col gap-2 rounded-lg border border-gray-primary bg-black-secondary py-2 md:inset-x-auto md:bottom-auto'}
         >
            {props.children}
         </div>
      </RenderModal>
   )
}

interface ButtonProps {
   children: React.ReactNode
   onClick?: () => void
}

export function Button(props: ButtonProps) {
   return (
      <button
         className='w-full cursor-pointer px-4 py-2 text-start text-nowrap transition-all hover:bg-neutral-900/50 md:py-0.5'
         onClick={props.onClick}
      >
         {props.children}
      </button>
   )
}
