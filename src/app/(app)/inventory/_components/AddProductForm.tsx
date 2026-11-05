import { useState } from 'react'

import RenderModal from '@/components/RenderModal'
import Button from '@/components/ui/buttons/Button'
import Loader from '@/components/ui/Loader'
import { Product } from '@/domain/inventory/Product'
import { Cups as CupsProduct, getProductKind, Ink as InkProduct, LiquidSoap as LiquidSoapProduct, Needle as NeedleProduct, NitrileGloves as NitrileGlovesProduct, PenCartridge as PenCartridgeProduct, SolidVaseline as SolidVaselineProduct, Stencil as StencilProduct, TongueDepressor as TongueDepressorProduct } from '@/domain/inventory/products'
import { ProductType } from '@/domain/inventory/ProductType'

import ProductBrandField from './form/ProductBrandField'
import ProductTypeField from './form/ProductTypeField'
import Cups, { CupsField } from './products/Cups'
import DefaultProduct from './products/DefaultProduct'
import HectographPaper from './products/HectographPaper'
import Ink, { InkField } from './products/Ink'
import LiquidSoap, { LiquidSoapField } from './products/LiquidSoap'
import Needle from './products/Needle'
import NitrileGloves, { NitrileGlovesField } from './products/NitrileGloves'
import PenCartridges, { PenCartridgesField } from './products/PenCartridges'
import SolidVaseline from './products/SolidVaseline'
import Stencil, { StencilField } from './products/Stencil'
import TongueDepressor from './products/TongueDepressor'

interface Props {
   productTypes: ProductType[]
   brands: string[]
   onAdd: (product: Product) => Promise<void>
   onCreateType: (value: string) => Promise<ProductType>
   onClose: () => void
}

interface ProductFormState {
   name: string
   brand: string
   stock: string
   measure: string
   expirationDate: string
   cupsSize: string
   quantityInGrams: string
   penCartridgeMeasure: string
   penCartridgeExpirationDate: string
   inkSizeInOz: string
   inkColor: string
   inkExpirationDate: string
   liquidSoapLiters: string
   liquidSoapExpirationDate: string
   nitrileGlovesSize: string
   nitrileGlovesExpirationDate: string
   stencilMilliliters: string
   stencilExpirationDate: string
   tongueDepressorExpirationDate: string
   error: string
}

export default function AddProductForm({ productTypes, brands, onAdd, onCreateType, onClose }: Props) {
   const [formState, setFormState] = useState<ProductFormState>({
      name: '',
      brand: '',
      stock: '0',
      measure: '',
      expirationDate: '',
      cupsSize: '',
      quantityInGrams: '',
      penCartridgeMeasure: '',
      penCartridgeExpirationDate: '',
      inkSizeInOz: '',
      inkColor: '',
      inkExpirationDate: '',
      liquidSoapLiters: '',
      liquidSoapExpirationDate: '',
      nitrileGlovesSize: '',
      nitrileGlovesExpirationDate: '',
      stencilMilliliters: '',
      stencilExpirationDate: '',
      tongueDepressorExpirationDate: '',
      error: ''
   })
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [isSavingType, setIsSavingType] = useState(false)
   const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)

   const selectedType = productTypes.find((type) => type.id === selectedTypeId) ?? productTypes[0]
   const selectedProductKind = getProductKind(selectedType?.value)
   const brandIsOptional = selectedProductKind === 'tongue-depressor' || selectedProductKind === 'liquid-soap' || selectedProductKind === 'nitrile-gloves' || selectedProductKind === 'cups' || selectedProductKind === 'hectograph-paper'

   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()
      const parsedStock = Number(formState.stock)
      const brand = formState.brand.trim()

      if (!brand && !brandIsOptional) {
         setFormState((current) => ({ ...current, error: 'La marca es obligatoria.' }))
         return
      }

      if (!selectedType) {
         setFormState((current) => ({ ...current, error: 'Seleccioná un tipo de producto.' }))
         return
      }

      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
         setFormState((current) => ({ ...current, error: 'El stock debe ser un número entero mayor o igual a cero.' }))
         return
      }

      const type = selectedType

      let product: Product

      try {
         if (selectedProductKind === 'ink') {
            const sizeInOz = Number(formState.inkSizeInOz)

            if (!Number.isFinite(sizeInOz) || sizeInOz <= 0) {
               setFormState((current) => ({ ...current, error: 'El tamaño en onzas debe ser mayor a cero.' }))
               return
            }

            const color = formState.inkColor.trim()

            if (!color) {
               setFormState((current) => ({ ...current, error: 'El color de la tinta es obligatorio.' }))
               return
            }

            const expirationDate = expirationDateToIso(formState.inkExpirationDate)

            if (formState.inkExpirationDate.trim() && !expirationDate) {
               setFormState((current) => ({ ...current, error: 'La fecha de vencimiento no es válida.' }))
               return
            }

            product = new InkProduct({
               name: buildProductName(type.value, `${sizeInOz} oz ${color}`, brand),
               brand,
               type,
               stock: parsedStock,
               sizeInOz,
               color,
               expirationDate
            })
         } else if (selectedProductKind === 'needle') {
            const measure = formState.measure.trim()

            if (!measure) {
               setFormState((current) => ({ ...current, error: 'La medida de la aguja es obligatoria.' }))
               return
            }

            const expirationDate = expirationDateToIso(formState.expirationDate)

            if (formState.expirationDate.trim() && !expirationDate) {
               setFormState((current) => ({ ...current, error: 'La fecha de vencimiento no es válida.' }))
               return
            }

            product = new NeedleProduct({
               name: buildProductName(type.value, measure, brand),
               brand,
               type,
               stock: parsedStock,
               measure,
               expirationDate
            })
         } else if (selectedProductKind === 'pen-cartridges') {
            const measure = formState.penCartridgeMeasure.trim()

            if (!measure) {
               setFormState((current) => ({ ...current, error: 'La medida del cartucho es obligatoria.' }))
               return
            }

            const expirationDate = expirationDateToIso(formState.penCartridgeExpirationDate)

            if (formState.penCartridgeExpirationDate.trim() && !expirationDate) {
               setFormState((current) => ({ ...current, error: 'La fecha de vencimiento no es válida.' }))
               return
            }

            product = new PenCartridgeProduct({
               name: buildProductName(type.value, measure, brand),
               brand,
               type,
               stock: parsedStock,
               measure,
               expirationDate
            })
         } else if (selectedProductKind === 'liquid-soap') {
            const liters = Number(formState.liquidSoapLiters)

            if (!Number.isFinite(liters) || liters <= 0) {
               setFormState((current) => ({ ...current, error: 'La medida en litros debe ser mayor a cero.' }))
               return
            }

            const expirationDate = expirationDateToIso(formState.liquidSoapExpirationDate)

            if (formState.liquidSoapExpirationDate.trim() && !expirationDate) {
               setFormState((current) => ({ ...current, error: 'La fecha de vencimiento no es válida.' }))
               return
            }

            product = new LiquidSoapProduct({
               name: buildProductName(type.value, `${liters} L`, brand),
               brand,
               type,
               stock: parsedStock,
               liters,
               expirationDate
            })
         } else if (selectedProductKind === 'cups') {
            const size = formState.cupsSize.trim()

            if (!size) {
               setFormState((current) => ({ ...current, error: 'La medida de las tetinas es obligatoria.' }))
               return
            }

            product = new CupsProduct({
               name: buildProductName(type.value, size, brand),
               brand,
               type,
               stock: parsedStock,
               size
            })
         } else if (selectedProductKind === 'nitrile-gloves') {
            const size = formState.nitrileGlovesSize.trim()

            if (!size) {
               setFormState((current) => ({ ...current, error: 'La medida de los guantes es obligatoria.' }))
               return
            }

            const expirationDate = expirationDateToIso(formState.nitrileGlovesExpirationDate)

            if (formState.nitrileGlovesExpirationDate.trim() && !expirationDate) {
               setFormState((current) => ({ ...current, error: 'La fecha de vencimiento no es válida.' }))
               return
            }

            product = new NitrileGlovesProduct({
               name: buildProductName(type.value, size, brand),
               brand,
               type,
               stock: parsedStock,
               size,
               expirationDate
            })
         } else if (selectedProductKind === 'stencil') {
            const milliliters = Number(formState.stencilMilliliters)

            if (!Number.isFinite(milliliters) || milliliters <= 0) {
               setFormState((current) => ({ ...current, error: 'La medida en mililitros debe ser mayor a cero.' }))
               return
            }

            const expirationDate = expirationDateToIso(formState.stencilExpirationDate)

            if (formState.stencilExpirationDate.trim() && !expirationDate) {
               setFormState((current) => ({ ...current, error: 'La fecha de vencimiento no es válida.' }))
               return
            }

            product = new StencilProduct({
               name: buildProductName(type.value, `${milliliters} ml`, brand),
               brand,
               type,
               stock: parsedStock,
               milliliters,
               expirationDate
            })
         } else if (selectedProductKind === 'tongue-depressor') {
            const expirationDate = expirationDateToIso(formState.tongueDepressorExpirationDate)

            if (formState.tongueDepressorExpirationDate.trim() && !expirationDate) {
               setFormState((current) => ({ ...current, error: 'La fecha de vencimiento no es válida.' }))
               return
            }

            product = new TongueDepressorProduct({
               name: buildProductName(type.value, '', brand),
               brand,
               type,
               stock: parsedStock,
               expirationDate
            })
         } else if (selectedProductKind === 'solid-vaseline') {
            const quantityInGrams = Number(formState.quantityInGrams)

            if (!Number.isFinite(quantityInGrams) || quantityInGrams <= 0) {
               setFormState((current) => ({ ...current, error: 'La cantidad en gramos debe ser mayor a cero.' }))
               return
            }

            product = new SolidVaselineProduct({
               name: buildProductName(type.value, `${quantityInGrams} g`, brand),
               brand,
               type,
               stock: parsedStock,
               quantityInGrams
            })
         } else if (selectedProductKind === 'hectograph-paper') {
            product = new Product({
               name: type.value,
               brand: '',
               type,
               stock: parsedStock
            })
         } else {
            if (!formState.name.trim()) {
               setFormState((current) => ({ ...current, error: 'El nombre es obligatorio.' }))
               return
            }

            product = new Product({
               name: formState.name.trim(),
               brand,
               type,
               stock: parsedStock
            })
         }
      } catch (error: unknown) {
         const message = error instanceof Error && error.message
            ? error.message
            : 'No se pudo agregar el producto.'

         setFormState((current) => ({ ...current, error: message }))
         return
      }

      setFormState((current) => ({ ...current, error: '' }))
      setIsSubmitting(true)

      try {
         await onAdd(product)
      } catch (error: unknown) {
         const message = error instanceof Error && error.message
            ? error.message
            : 'No se pudo agregar el producto.'

         setFormState((current) => ({ ...current, error: message }))
      } finally {
         setIsSubmitting(false)
      }
   }

   function handleTypeChange(typeId: number) {
      setSelectedTypeId(typeId)
      resetSpecificFields()
   }

   function handlePenCartridgeChange(field: PenCartridgesField, value: string) {
      setFormState((current) => {
         if (field === 'measure') return { ...current, penCartridgeMeasure: value }
         if (field === 'expirationDate') return { ...current, penCartridgeExpirationDate: value }

         return { ...current, [field]: value }
      })
   }

   function handleInkChange(field: InkField, value: string) {
      setFormState((current) => {
         if (field === 'sizeInOz') return { ...current, inkSizeInOz: value }
         if (field === 'color') return { ...current, inkColor: value }
         if (field === 'expirationDate') return { ...current, inkExpirationDate: value }

         return { ...current, [field]: value }
      })
   }

   function handleLiquidSoapChange(field: LiquidSoapField, value: string) {
      setFormState((current) => {
         if (field === 'liters') return { ...current, liquidSoapLiters: value }
         if (field === 'expirationDate') return { ...current, liquidSoapExpirationDate: value }

         return { ...current, [field]: value }
      })
   }

   function handleCupsChange(field: CupsField, value: string) {
      setFormState((current) => {
         if (field === 'size') return { ...current, cupsSize: value }

         return { ...current, [field]: value }
      })
   }

   function handleNitrileGlovesChange(field: NitrileGlovesField, value: string) {
      setFormState((current) => {
         if (field === 'size') return { ...current, nitrileGlovesSize: value }
         if (field === 'expirationDate') return { ...current, nitrileGlovesExpirationDate: value }

         return { ...current, [field]: value }
      })
   }

   function handleStencilChange(field: StencilField, value: string) {
      setFormState((current) => {
         if (field === 'milliliters') return { ...current, stencilMilliliters: value }
         if (field === 'expirationDate') return { ...current, stencilExpirationDate: value }

         return { ...current, [field]: value }
      })
   }

   function resetSpecificFields() {
      setFormState((current) => ({
         ...current,
         measure: '',
         expirationDate: '',
         cupsSize: '',
         quantityInGrams: '',
         penCartridgeMeasure: '',
         penCartridgeExpirationDate: '',
         inkSizeInOz: '',
         inkColor: '',
         inkExpirationDate: '',
         liquidSoapLiters: '',
         liquidSoapExpirationDate: '',
         nitrileGlovesSize: '',
         nitrileGlovesExpirationDate: '',
         stencilMilliliters: '',
         stencilExpirationDate: '',
         tongueDepressorExpirationDate: '',
         error: ''
      }))
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
                  disabled={isSubmitting || isSavingType}
                  className='cursor-pointer p-1 text-gray-400 transition-colors hover:text-white disabled:cursor-default disabled:opacity-40'
                  onClick={onClose}
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="1.2em" height="1.2em">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </header>

            <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:px-6 md:py-5'>
               <ProductTypeField
                  productTypes={productTypes}
                  value={selectedTypeId}
                  onChange={handleTypeChange}
                  onCreateType={onCreateType}
                  onError={(message) => setFormState((current) => ({ ...current, error: message }))}
                  isSavingType={isSavingType}
                  onSavingTypeChange={setIsSavingType}
               />

               {selectedProductKind !== 'hectograph-paper' && (
                  <ProductBrandField
                     brands={brands}
                     value={formState.brand}
                     optional={brandIsOptional}
                     onChange={(brand) => setFormState((current) => ({ ...current, brand }))}
                     onError={(message) => setFormState((current) => ({ ...current, error: message }))}
                  />
               )}

               {selectedProductKind === 'ink' && (
                  <Ink
                     sizeInOz={formState.inkSizeInOz}
                     color={formState.inkColor}
                     expirationDate={formState.inkExpirationDate}
                     stock={formState.stock}
                     onChange={handleInkChange}
                  />
               )}

               {selectedProductKind === 'needle' && (
                  <Needle
                     measure={formState.measure}
                     expirationDate={formState.expirationDate}
                     stock={formState.stock}
                     onChange={(field, value) => setFormState((current) => ({ ...current, [field]: value }))}
                  />
               )}

               {selectedProductKind === 'pen-cartridges' && (
                  <PenCartridges
                     measure={formState.penCartridgeMeasure}
                     expirationDate={formState.penCartridgeExpirationDate}
                     stock={formState.stock}
                     onChange={handlePenCartridgeChange}
                  />
               )}

               {selectedProductKind === 'solid-vaseline' && (
                  <SolidVaseline
                     quantityInGrams={formState.quantityInGrams}
                     stock={formState.stock}
                     onChange={(field, value) => setFormState((current) => ({ ...current, [field]: value }))}
                  />
               )}

               {selectedProductKind === 'liquid-soap' && (
                  <LiquidSoap
                     liters={formState.liquidSoapLiters}
                     expirationDate={formState.liquidSoapExpirationDate}
                     stock={formState.stock}
                     onChange={handleLiquidSoapChange}
                  />
               )}

               {selectedProductKind === 'cups' && (
                  <Cups
                     size={formState.cupsSize}
                     stock={formState.stock}
                     onChange={handleCupsChange}
                  />
               )}

               {selectedProductKind === 'nitrile-gloves' && (
                  <NitrileGloves
                     size={formState.nitrileGlovesSize}
                     expirationDate={formState.nitrileGlovesExpirationDate}
                     stock={formState.stock}
                     onChange={handleNitrileGlovesChange}
                  />
               )}

               {selectedProductKind === 'stencil' && (
                  <Stencil
                     milliliters={formState.stencilMilliliters}
                     expirationDate={formState.stencilExpirationDate}
                     stock={formState.stock}
                     onChange={handleStencilChange}
                  />
               )}

               {selectedProductKind === 'tongue-depressor' && (
                  <TongueDepressor
                     expirationDate={formState.tongueDepressorExpirationDate}
                     stock={formState.stock}
                     onChange={(field, value) => setFormState((current) => (
                        field === 'expirationDate'
                           ? { ...current, tongueDepressorExpirationDate: value }
                           : { ...current, [field]: value }
                     ))}
                  />
               )}

               {selectedProductKind === 'hectograph-paper' && (
                  <HectographPaper
                     stock={formState.stock}
                     onChange={(value) => setFormState((current) => ({ ...current, stock: value }))}
                  />
               )}

               {selectedProductKind === 'default' && (
                  <DefaultProduct
                     name={formState.name}
                     stock={formState.stock}
                     onChange={(field, value) => setFormState((current) => ({ ...current, [field]: value }))}
                  />
               )}

               {formState.error && (
                  <p className='rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400'>
                     {formState.error}
                  </p>
               )}
            </div>

            <footer className='flex gap-2 border-t border-gray-primary p-4 md:border-0 md:px-6 md:pb-6'>
               <Button
                  disabled={isSubmitting || isSavingType}
                  onClick={onClose}
                  variant='outline'
               >
                  Cancelar
               </Button>

               <Button
                  type='submit'
                  disabled={isSubmitting || isSavingType}
                  variant='filled'
               >
                  {isSubmitting ? <Loader size='16px' /> : 'Agregar'}
               </Button>
            </footer>
         </form>
      </RenderModal>
   )
}

function buildProductName(type: string, detail: string, brand: string): string {
   return `${type} ${detail}${brand ? ` - ${brand}` : ''}`.trim()
}

function expirationDateToIso(value: string): string | null {
   const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

   if (!match) return null

   const [, day, month, year] = match
   const date = new Date(`${year}-${month}-${day}T00:00:00`)

   if (isNaN(date.getTime())) return null
   if (date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day)) return null

   return `${year}-${month}-${day}`
}

