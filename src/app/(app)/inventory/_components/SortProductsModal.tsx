import { useEffect, useState } from 'react'

import RenderModal from '@/components/RenderModal'
import Button from '@/components/ui/buttons/Button'

export type ProductSortField = 'name' | 'stock' | 'type'
export type SortDirection = 'asc' | 'desc'

interface Props {
   field: ProductSortField
   direction: SortDirection
   onApply: (field: ProductSortField, direction: SortDirection) => void
   onClose: () => void
}

const fieldOptions: { value: ProductSortField, label: string }[] = [
   { value: 'name', label: 'Nombre' },
   { value: 'stock', label: 'Stock' },
   { value: 'type', label: 'Tipo' }
]

const directionOptions: { value: SortDirection, label: string }[] = [
   { value: 'asc', label: 'Ascendente' },
   { value: 'desc', label: 'Descendente' }
]

export default function SortProductsModal({ field, direction, onApply, onClose }: Props) {
   const [selectedField, setSelectedField] = useState(field)
   const [selectedDirection, setSelectedDirection] = useState(direction)
   const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)

   useEffect(() => {
      const mediaQuery = window.matchMedia('(max-width: 767px)')
      const handleChange = () => setIsMobile(mediaQuery.matches)

      mediaQuery.addEventListener('change', handleChange)

      return () => mediaQuery.removeEventListener('change', handleChange)
   }, [])

   const content = (
      <>
         <header className='flex flex-col gap-1 border-b border-gray-primary p-4'>
            <h2 className='text-lg font-bold'>
               Ordenar productos
            </h2>
         </header>

         <div className='flex flex-col gap-4 p-4'>
            <div className='flex flex-col gap-2'>
               <span className='text-xs text-gray-400'>
                  Ordenar por
               </span>

               <div className='grid grid-cols-3 gap-2'>
                  {fieldOptions.map((option) =>
                     <button
                        key={option.value}
                        type='button'
                        className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors ${selectedField === option.value ? 'border-white/40 bg-gray-primary text-white' : 'border-gray-primary bg-black-secondary text-gray-400 hover:text-white'}`}
                        onClick={() => setSelectedField(option.value)}
                     >
                        {option.label}
                     </button>
                  )}
               </div>
            </div>

            <div className='flex flex-col gap-2'>
               <span className='text-xs text-gray-400'>
                  Dirección
               </span>

               <div className='grid grid-cols-2 gap-2'>
                  {directionOptions.map((option) =>
                     <button
                        key={option.value}
                        type='button'
                        className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors ${selectedDirection === option.value ? 'border-white/40 bg-gray-primary text-white' : 'border-gray-primary bg-black-secondary text-gray-400 hover:text-white'}`}
                        onClick={() => setSelectedDirection(option.value)}
                     >
                        {option.label}
                     </button>
                  )}
               </div>
            </div>
         </div>

         <footer className='flex gap-2 border-t border-gray-primary p-4'>
            <Button
               variant='outline'
               className='flex-1'
               onClick={onClose}
            >
               Cancelar
            </Button>

            <Button
               variant='filled'
               className='flex-1'
               onClick={() => onApply(selectedField, selectedDirection)}
            >
               Aplicar
            </Button>
         </footer>
      </>
   )

   if (isMobile) {
      return (
         <RenderModal onClickOutside={onClose}>
            <div
               role='dialog'
               aria-modal='true'
               aria-label='Ordenar productos'
               className='mx-4 flex w-full max-w-sm flex-col rounded-lg border border-gray-primary bg-black-secondary shadow-2xl'
            >
               {content}
            </div>
         </RenderModal>
      )
   }

   return (
      <div
         role='dialog'
         aria-label='Ordenar productos'
         className='absolute top-full right-0 z-50 mt-2 flex w-80 max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-gray-primary bg-black-secondary shadow-2xl'
      >
         {content}
      </div>
   )
}
