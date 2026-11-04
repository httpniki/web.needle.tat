import { useEffect, useRef, useState } from 'react'

import InputSelect from '@/components/ui/InputSelect'

interface Props {
   brands: string[]
   value: string
   onChange: (brand: string) => void
   onError: (message: string) => void
}

export default function ProductBrandField(props: Props) {
   const [isAddingBrand, setIsAddingBrand] = useState(false)
   const [newBrandName, setNewBrandName] = useState('')
   const [customBrands, setCustomBrands] = useState<string[]>([])

   const addBrandRef = useRef<HTMLDivElement>(null)

   const brandOptions = Array.from(new Set([...props.brands, ...customBrands]))
   const selectOptions = brandOptions.map((brand) => ({ value: brand, label: brand }))

   useEffect(() => {
      if (!isAddingBrand) return

      function handleClickOutside(event: MouseEvent) {
         if (addBrandRef.current?.contains(event.target as Node)) return

         closeAddBrand()
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [isAddingBrand])

   function handleAddBrand() {
      const value = newBrandName.trim()

      if (!value) {
         props.onError('El nombre de la marca es obligatorio.')
         return
      }

      if (value.length > 100) {
         props.onError('El nombre de la marca no puede superar los 100 caracteres.')
         return
      }

      const existingBrand = brandOptions.find((brand) => normalize(brand) === normalize(value))

      if (existingBrand) {
         props.onChange(existingBrand)
         setIsAddingBrand(false)
         setNewBrandName('')
         props.onError('Esa marca ya existe. Se seleccionó la existente.')
         return
      }

      setCustomBrands((current) => [...current, value])
      props.onChange(value)
      setIsAddingBrand(false)
      setNewBrandName('')
      props.onError('')
   }

   function closeAddBrand() {
      setIsAddingBrand(false)
      setNewBrandName('')
      props.onError('')
   }

   return (
      <div className='flex flex-col gap-1.5'>
         <div className='flex items-center justify-between gap-2'>
            <span className='text-xs text-gray-400'>
               Marca
            </span>

            {!isAddingBrand && (
               <button
                  type='button'
                  className='cursor-pointer text-xs text-gray-400 transition-colors hover:text-white'
                  onClick={() => {
                     setIsAddingBrand(true)
                     props.onError('')
                  }}
               >
                  + Nueva marca
               </button>
            )}
         </div>

         <div onClick={() => { if (isAddingBrand) closeAddBrand() }}>
            <InputSelect
               id='product-brand'
               options={selectOptions}
               value={props.value}
               placeholder='Seleccionar marca'
               onChange={(value) => {
                  props.onChange(value)
                  props.onError('')
               }}
            />
         </div>

         {isAddingBrand && (
            <div ref={addBrandRef} className='flex flex-col gap-2 rounded-md border border-gray-primary bg-black/20 p-3'>
               <input
                  id='new-product-brand'
                  type='text'
                  aria-label='Nombre de la nueva marca'
                  placeholder='Ej: Eternal Ink'
                  value={newBrandName}
                  autoFocus
                  className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40'
                  onChange={(event) => {
                     setNewBrandName(event.target.value)
                     props.onError('')
                  }}
                  onKeyDown={(event) => {
                     if (event.key !== 'Enter') return

                     event.preventDefault()
                     handleAddBrand()
                  }}
               />

               <div className='flex justify-end gap-2'>
                  <button
                     type='button'
                     className='cursor-pointer rounded-md border border-gray-primary px-3 py-2 text-xs text-gray-300 transition-colors hover:bg-gray-primary hover:text-white'
                     onClick={closeAddBrand}
                  >
                     Cancelar
                  </button>

                  <button
                     type='button'
                     className='flex cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-gray-primary px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-80'
                     onClick={handleAddBrand}
                  >
                     Agregar
                  </button>
               </div>
            </div>
         )}
      </div>
   )
}

function normalize(value: string) {
   return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
}
