import { useEffect, useRef, useState } from 'react'

import RenderModal from '@/components/RenderModal'
import TextInput from '@/components/ui/inputs/TextInput'
import InputSelect from '@/components/ui/InputSelect'
import Loader from '@/components/ui/Loader'
import { Product } from '@/domain/inventory/Product'
import { ProductType } from '@/domain/inventory/ProductType'

interface Props {
   productTypes: ProductType[]
   onAdd: (product: Product) => Promise<void>
   onClose: () => void
}

interface ProductTypeState {
   typeId: number | null
   isCreatingType: boolean
   newTypeName: string
   pendingTypeName: string
}

interface ProductFormState {
   name: string
   brand: string
   stock: string
   error: string
}

const NEW_TYPE_VALUE = 'new'

export default function NewProductForm({ productTypes, onAdd, onClose }: Props) {
   const [formState, setFormState] = useState<ProductFormState>({
      name: '',
      brand: '',
      stock: '0',
      error: ''
   })
   const [isSubmitting, setIsSubmitting] = useState(false)

   const [productTypeState, setProductTypeState] = useState<ProductTypeState>({
      typeId: null,
      isCreatingType: false,
      newTypeName: '',
      pendingTypeName: ''
   })

   const createTypeRef = useRef<HTMLDivElement>(null)

   const selectedType = productTypes.find((type) => type.id === productTypeState.typeId) ?? productTypes[0]
   const selectedTypeValue = productTypeState.pendingTypeName
      ? NEW_TYPE_VALUE
      : selectedType
         ? String(selectedType.id)
         : ''
   const productTypeOptions = [
      ...productTypes.map((type) => ({ value: String(type.id), label: type.value })),
      ...(productTypeState.pendingTypeName ? [{ value: NEW_TYPE_VALUE, label: productTypeState.pendingTypeName }] : [])
   ]

   useEffect(() => {
      if (!productTypeState.isCreatingType) return

      function handleClickOutside(event: MouseEvent) {
         if (createTypeRef.current?.contains(event.target as Node)) return

         closeCreateType()
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [productTypeState.isCreatingType])

   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()
      const parsedStock = Number(formState.stock)

      if (!formState.name.trim() || !formState.brand.trim()) {
         setFormState((current) => ({ ...current, error: 'El nombre y la marca son obligatorios.' }))
         return
      }

      if (!selectedType && !productTypeState.pendingTypeName) {
         setFormState((current) => ({ ...current, error: 'Seleccioná un tipo de producto.' }))
         return
      }

      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
         setFormState((current) => ({ ...current, error: 'El stock debe ser un número entero mayor o igual a cero.' }))
         return
      }

      const type = productTypeState.pendingTypeName
         ? new ProductType({ value: productTypeState.pendingTypeName })
         : selectedType

      if (!type) return

      setIsSubmitting(true)
      setFormState((current) => ({ ...current, error: '' }))

      try {
         await onAdd(new Product({
            name: formState.name.trim(),
            brand: formState.brand.trim(),
            type,
            stock: parsedStock
         }))
      } finally {
         setIsSubmitting(false)
      }
   }

   function handleCreateType() {
      const value = productTypeState.newTypeName.trim()

      if (!value) {
         setFormState((current) => ({ ...current, error: 'El nombre del tipo es obligatorio.' }))
         return
      }

      if (value.length > 100) {
         setFormState((current) => ({ ...current, error: 'El nombre del tipo no puede superar los 100 caracteres.' }))
         return
      }

      const existingType = productTypes.find((type) => normalize(type.value) === normalize(value))

      if (existingType) {
         setProductTypeState((current) => ({
            ...current,
            typeId: existingType.id,
            pendingTypeName: '',
            newTypeName: '',
            isCreatingType: false
         }))
         setFormState((current) => ({ ...current, error: 'Ese tipo ya existe. Se seleccionó el existente.' }))
         return
      }

      setProductTypeState((current) => ({
         ...current,
         pendingTypeName: value,
         typeId: null,
         newTypeName: '',
         isCreatingType: false
      }))
      setFormState((current) => ({ ...current, error: '' }))
   }

   function closeCreateType() {
      setProductTypeState((current) => ({
         ...current,
         newTypeName: '',
         isCreatingType: false
      }))
      setFormState((current) => ({ ...current, error: '' }))
   }

   return (
      <RenderModal
         className='bg-black-primary md:flex md:items-center md:justify-center md:bg-black/80'
         onClickOutside={onClose}
      >
         <form
            className='flex size-full flex-col bg-black-primary md:size-auto md:max-h-[90vh] md:w-full md:max-w-lg md:rounded-lg md:border md:border-gray-primary md:shadow-2xl'
            onSubmit={handleSubmit}
         >
            <header className='flex items-start justify-between gap-4 border-b border-gray-primary p-4 md:border-0 md:px-6 md:pt-6'>
               <div className='flex flex-col gap-1'>
                  <h2 className='text-lg font-bold'>
                     Nuevo producto
                  </h2>

                  <p className='text-xs text-gray-400'>
                     Completá los datos del producto para agregarlo al inventario.
                  </p>
               </div>

               <button
                  type='button'
                  aria-label='Cerrar'
                  disabled={isSubmitting}
                  className='cursor-pointer p-1 text-gray-400 transition-colors hover:text-white disabled:cursor-default disabled:opacity-40'
                  onClick={onClose}
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="1.2em" height="1.2em">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </header>

            <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:px-6 md:py-5'>
               <label className='flex flex-col gap-1.5'>
                  <span className='text-xs text-gray-400'>
                     Nombre
                  </span>

                  <TextInput
                     id='product-name'
                     placeholder='Ej: Agujas 0.30 mm RL'
                     value={formState.name}
                     autoFocus
                     onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                  />
               </label>

               <label className='flex flex-col gap-1.5'>
                  <span className='text-xs text-gray-400'>
                     Marca
                  </span>

                  <TextInput
                     id='product-brand'
                     placeholder='Ej: Redline'
                     value={formState.brand}
                     onChange={(event) => setFormState((current) => ({ ...current, brand: event.target.value }))}
                  />
               </label>

               <div className='flex flex-col gap-1.5'>
                  <div className='flex items-center justify-between gap-2'>
                     <span className='text-xs text-gray-400'>
                        Tipo
                     </span>

                     {!productTypeState.isCreatingType && (
                        <button
                           type='button'
                           className='cursor-pointer text-xs text-gray-400 transition-colors hover:text-white'
                           onClick={() => {
                              setProductTypeState((current) => ({
                                 ...current,
                                 isCreatingType: true
                              }))
                              setFormState((current) => ({ ...current, error: '' }))
                           }}
                        >
                           + Nuevo tipo
                        </button>
                     )}
                  </div>

                  <div onClick={() => { if (productTypeState.isCreatingType) closeCreateType() }}>
                     <InputSelect
                        id='product-type'
                        options={productTypeOptions}
                        value={selectedTypeValue}
                        onChange={(value) => {
                           if (value === NEW_TYPE_VALUE) return

                           setProductTypeState((current) => ({
                              ...current,
                              pendingTypeName: '',
                              typeId: Number(value)
                           }))
                        }}
                     />
                  </div>

                  {productTypeState.isCreatingType && (
                     <div ref={createTypeRef} className='flex flex-col gap-2 rounded-md border border-gray-primary bg-black/20 p-3'>
                        <input
                           id='new-product-type'
                           type='text'
                           aria-label='Nombre del nuevo tipo'
                           placeholder='Ej: Limpieza'
                           value={productTypeState.newTypeName}
                           autoFocus
                           className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40'
                           onChange={(event) => {
                              setProductTypeState((current) => ({
                                 ...current,
                                 newTypeName: event.target.value
                              }))
                              if (formState.error) setFormState((current) => ({ ...current, error: '' }))
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
                              className='cursor-pointer rounded-md border border-gray-primary px-3 py-2 text-xs text-gray-300 transition-colors hover:bg-gray-primary hover:text-white'
                              onClick={closeCreateType}
                           >
                              Cancelar
                           </button>

                           <button
                              type='button'
                              className='flex cursor-pointer items-center justify-center gap-2 rounded-md border border-white/40 bg-gray-primary px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-80'
                              onClick={handleCreateType}
                           >
                              Guardar
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               <label className='flex flex-col gap-1.5'>
                  <span className='text-xs text-gray-400'>
                     Stock
                  </span>

                  <input
                     id='product-stock'
                     type='number'
                     min={0}
                     step={1}
                     value={formState.stock}
                     className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40'
                     onChange={(event) => setFormState((current) => ({ ...current, stock: event.target.value }))}
                  />
               </label>

               {formState.error && (
                  <p className='rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400'>
                     {formState.error}
                  </p>
               )}
            </div>

            <footer className='flex gap-2 border-t border-gray-primary p-4 md:border-0 md:px-6 md:pb-6'>
               <button
                  type='button'
                  disabled={isSubmitting}
                  className='flex-1 cursor-pointer rounded-md border border-gray-primary px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-primary hover:text-white disabled:cursor-default disabled:opacity-40 md:flex-none'
                  onClick={onClose}
               >
                  Cancelar
               </button>

               <button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/40 bg-gray-primary px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50 md:flex-none'
               >
                  {isSubmitting ? <Loader size='16px' /> : 'Agregar'}
               </button>
            </footer>
         </form>
      </RenderModal>
   )
}

function normalize(value: string) {
   return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
}

