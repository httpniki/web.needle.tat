import { useEffect, useRef, useState } from 'react'

import InputSelect from '@/components/ui/InputSelect'
import Loader from '@/components/ui/Loader'
import { ProductType } from '@/domain/inventory/ProductType'

interface Props {
   productTypes: ProductType[]
   value: number | null
   onChange: (typeId: number) => void
   onCreateType: (value: string) => Promise<ProductType>
   onError: (message: string) => void
   isSavingType: boolean
   onSavingTypeChange: (isSavingType: boolean) => void
}

export default function ProductTypeField(props: Props) {
   const [isCreatingType, setIsCreatingType] = useState(false)
   const [newTypeName, setNewTypeName] = useState('')

   const createTypeRef = useRef<HTMLDivElement>(null)

   const selectedType = props.productTypes.find((type) => type.id === props.value) ?? props.productTypes[0]
   const selectedTypeValue = selectedType ? String(selectedType.id) : ''
   const productTypeOptions = props.productTypes.map((type) => ({ value: String(type.id), label: type.value }))

   useEffect(() => {
      if (!isCreatingType) return

      function handleClickOutside(event: MouseEvent) {
         if (createTypeRef.current?.contains(event.target as Node)) return

         closeCreateType()
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [isCreatingType])

   async function handleCreateType() {
      if (props.isSavingType) return

      const value = newTypeName.trim()

      if (!value) {
         props.onError('El nombre del tipo es obligatorio.')
         return
      }

      if (value.length > 100) {
         props.onError('El nombre del tipo no puede superar los 100 caracteres.')
         return
      }

      const existingType = props.productTypes.find((type) => normalize(type.value) === normalize(value))

      if (existingType) {
         props.onChange(existingType.id)
         setIsCreatingType(false)
         setNewTypeName('')
         props.onError('Ese tipo ya existe. Se seleccionó el existente.')
         return
      }

      props.onSavingTypeChange(true)
      props.onError('')

      try {
         const createdType = await props.onCreateType(value)

         props.onChange(createdType.id)
         setIsCreatingType(false)
         setNewTypeName('')
      } catch (error: unknown) {
         const message = error instanceof Error && error.message
            ? error.message
            : 'No se pudo crear el tipo de producto.'

         props.onError(message)
      } finally {
         props.onSavingTypeChange(false)
      }
   }

   function handleTypeSelect(value: string) {
      props.onChange(Number(value))
   }

   function closeCreateType() {
      setIsCreatingType(false)
      setNewTypeName('')
      props.onError('')
   }

   return (
      <div className='flex flex-col gap-1.5'>
         <div className='flex items-center justify-between gap-2'>
            <span className='text-xs text-gray-400'>
               Tipo
            </span>

            {!isCreatingType && (
               <button
                  type='button'
                  className='cursor-pointer text-xs text-gray-400 transition-colors hover:text-white'
                  onClick={() => {
                     setIsCreatingType(true)
                     props.onError('')
                  }}
               >
                  + Nuevo tipo
               </button>
            )}
         </div>

         <div onClick={() => { if (isCreatingType) closeCreateType() }}>
            <InputSelect
               id='product-type'
               options={productTypeOptions}
               value={selectedTypeValue}
               onChange={handleTypeSelect}
            />
         </div>

         {isCreatingType && (
            <div ref={createTypeRef} className='flex flex-col gap-2 rounded-md border border-gray-primary bg-black/20 p-3'>
               <input
                  id='new-product-type'
                  type='text'
                  aria-label='Nombre del nuevo tipo'
                  placeholder='Ej: Limpieza'
                  value={newTypeName}
                  autoFocus
                  disabled={props.isSavingType}
                  className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40 disabled:cursor-default disabled:opacity-40'
                  onChange={(event) => {
                     setNewTypeName(event.target.value)
                     props.onError('')
                  }}
                  onKeyDown={(event) => {
                     if (event.key !== 'Enter') return

                     event.preventDefault()
                     handleCreateType()
                  }}
               />

               <div className='flex justify-end gap-2'>
                  <button
                     type='button'
                     disabled={props.isSavingType}
                     className='cursor-pointer rounded-md border border-gray-primary px-3 py-2 text-xs text-gray-300 transition-colors hover:bg-gray-primary hover:text-white disabled:cursor-default disabled:opacity-40'
                     onClick={closeCreateType}
                  >
                     Cancelar
                  </button>

                  <button
                     type='button'
                     disabled={props.isSavingType}
                     className='flex cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-gray-primary px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-40'
                     onClick={handleCreateType}
                  >
                     {props.isSavingType ? <Loader size='16px' /> : 'Guardar'}
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
