'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { createProduct, createProductType, decreaseProductStock, deleteProduct, increaseProductStock, updateProduct } from '@/actions/inventory-actions'
import { usePageHeader } from '@/app/(app)/_components/AppShell'
import { useInventory } from '@/app/(app)/_context/InventoryContext'
import { useToast } from '@/app/(app)/_context/ToastContext'
import Button from '@/components/ui/buttons/Button'
import SearchBar from '@/components/ui/SearchBar'
import { Product, ProductObject } from '@/domain/inventory/Product'
import { ProductType } from '@/domain/inventory/ProductType'

import DeleteProductModal from './_components/DeleteProductModal'
import ProductCard from './_components/ProductCard'
import ProductForm from './_components/ProductForm'
import SortProductsModal, { ProductSortField, SortDirection } from './_components/SortProductsModal'

export default function InventoryPage() {
   usePageHeader('Stock')
   const inventoryStore = useInventory()
   const toast = useToast()

   const [searchQuery, setSearchQuery] = useState('')
   const [typeFilter, setTypeFilter] = useState<number | null>(null)
   const [sort, setSort] = useState<{
      field: ProductSortField
      direction: SortDirection
      isOpen: boolean
   }>({
      field: 'name',
      direction: 'asc',
      isOpen: false
   })
   const sortMenuRef = useRef<HTMLDivElement>(null)

   const [productForm, setProductForm] = useState<{
      isOpen: boolean
      product: Product | null
   }>({
      isOpen: false,
      product: null
   })

   const [updatingStockProductId, setUpdatingStockProductId] = useState<number | null>(null)
   const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
   const [productToDelete, setProductToDelete] = useState<Product | null>(null)

   const filteredProducts = useMemo(() => {
      const term = normalize(searchQuery)

      return inventoryStore.products.filter((product) => {
         const matchesType = typeFilter === null || product.type.id === typeFilter
         const matchesQuery = normalize(`${product.name} ${product.brand} ${product.type.value}`).includes(term)

         return matchesType && matchesQuery
      })
   }, [inventoryStore.products, searchQuery, typeFilter])

   const sortedProducts = useMemo(() => {
      const collator = new Intl.Collator('es', { sensitivity: 'base' })

      return [...filteredProducts].sort((a, b) => {
         let result = 0

         if (sort.field === 'name') result = collator.compare(a.name, b.name)
         if (sort.field === 'stock') result = a.stock - b.stock || collator.compare(a.name, b.name)
         if (sort.field === 'type') result = collator.compare(a.type.value, b.type.value) || collator.compare(a.name, b.name)

         return sort.direction === 'asc' ? result : -result
      })
   }, [filteredProducts, sort.field, sort.direction])

   useEffect(() => {
      if (!sort.isOpen) return

      function handleMouseDown(event: MouseEvent) {
         if (window.matchMedia('(max-width: 767px)').matches) return
         if (sortMenuRef.current?.contains(event.target as Node)) return

         setSort((current) => ({ ...current, isOpen: false }))
      }

      document.addEventListener('mousedown', handleMouseDown)

      return () => document.removeEventListener('mousedown', handleMouseDown)
   }, [sort.isOpen])

   async function handleCreateProductType(value: string): Promise<ProductType> {
      const existingType = inventoryStore.productTypes.find((type) => normalize(type.value) === normalize(value))

      if (existingType) return existingType

      const createdType = await createProductType(value)

      return inventoryStore.addProductType(createdType)
   }

   async function handleSaveProduct(product: Product) {
      const productObject = product.toObject()
      const editingProduct = productForm.product
      let savedProduct: ProductObject

      try {
         let typeId = product.type.id

         if (typeId === 0) typeId = (await handleCreateProductType(product.type.value)).id

         productObject.type = { id: typeId, value: product.type.value }
         savedProduct = editingProduct
            ? await updateProduct(editingProduct.id, productObject)
            : await createProduct(productObject)
      } catch (error: unknown) {
         const fallback = editingProduct ? 'No se pudo actualizar el producto.' : 'No se pudo agregar el producto.'

         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: fallback, type: 'error' })
         return
      }

      inventoryStore.addProduct(savedProduct)
      setProductForm({ isOpen: false, product: null })
   }

   async function handleStockChange(productId: number, quantity: number, operation: 'increase' | 'decrease') {
      if (updatingStockProductId !== null || deletingProductId !== null) return

      setUpdatingStockProductId(productId)

      let updatedProduct: ProductObject

      try {
         updatedProduct = operation === 'increase'
            ? await increaseProductStock(productId, quantity)
            : await decreaseProductStock(productId, quantity)
      } catch (error: unknown) {
         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: 'No se pudo actualizar el stock.', type: 'error' })
         return
      } finally {
         setUpdatingStockProductId(null)
      }

      inventoryStore.addProduct(updatedProduct)
   }

   async function handleDeleteProduct(product: Product) {
      if (deletingProductId !== null || updatingStockProductId !== null) return
      setDeletingProductId(product.id)

      try {
         await deleteProduct(product.id)
      } catch (error: unknown) {
         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: 'No se pudo eliminar el producto.', type: 'error' })
         return
      } finally {
         setDeletingProductId(null)
      }

      inventoryStore.removeProduct(product.id)
      setProductToDelete(null)
   }

   return (
      <main className='flex h-max w-full flex-col gap-4 p-4 md:px-8'>
         <header className='mt-4 flex items-start justify-between gap-4'>
            <div className='flex flex-col gap-1'>
               <h1 className='text-2xl font-bold'>
                  Stock
               </h1>

               <p className='text-sm text-gray-400'>
                  Inventario de insumos y materiales del estudio.
               </p>
            </div>

            <Button
               variant='filled'
               className='shrink-0'
               onClick={() => setProductForm({ isOpen: true, product: null })}
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="1em" height="1em">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
               </svg>

               Agregar producto
            </Button>
         </header>

         <section className='flex flex-wrap items-center gap-2 text-xs'>
            <span className='rounded-md border border-gray-primary bg-black-secondary px-3 py-1.5 text-gray-300'>
               <span className='font-semibold text-white'>{inventoryStore.products.length}</span> productos
            </span>

            <span className='rounded-md border border-gray-primary bg-black-secondary px-3 py-1.5 text-gray-300'>
               <span className='font-semibold text-amber-600'>{inventoryStore.products.filter((product) => product.isLowStock()).length}</span> con stock bajo
            </span>
         </section>

         <SearchBar
            placeholder='Buscar por producto, marca o tipo...'
            onChange={(event) => setSearchQuery(event.target.value)}
         />

         <section className='flex flex-wrap gap-2'>
            <FilterChip
               active={typeFilter === null}
               label='Todos'
               onClick={() => setTypeFilter(null)}
            />

            {inventoryStore.productTypes.map((type) =>
               <FilterChip
                  key={type.id}
                  active={typeFilter === type.id}
                  label={type.value}
                  onClick={() => setTypeFilter(type.id)}
               />
            )}

            <div ref={sortMenuRef} className='relative ml-auto'>
               <button
                  type='button'
                  aria-haspopup='dialog'
                  aria-expanded={sort.isOpen}
                  className='flex cursor-pointer items-center gap-2 rounded-full border border-gray-primary bg-black-secondary px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white'
                  onClick={() => setSort((current) => ({ ...current, isOpen: !current.isOpen }))}
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="1em" height="1em">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v14m0 0-3-3m3 3 3-3M16 19V5m0 0-3 3m3-3 3 3" />
                  </svg>

                  Ordenar
               </button>

               {(sort.isOpen === true) &&
                  <SortProductsModal
                     field={sort.field}
                     direction={sort.direction}
                     onApply={(field, direction) => setSort((current) => ({ ...current, field, direction, isOpen: false }))}
                     onClose={() => setSort((current) => ({ ...current, isOpen: false }))}
                  />
               }
            </div>
         </section>

         {(filteredProducts.length === 0) &&
            <p className='text-sm text-gray-400'>
               No se encontraron productos.
            </p>
         }

         <ul className='grid gap-2 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]'>
            {sortedProducts.map((product) =>
               <li key={product.id}>
                  <ProductCard
                     product={product}
                     isUpdating={updatingStockProductId === product.id}
                     isDeleting={deletingProductId === product.id}
                     onIncrease={(quantity) => handleStockChange(product.id, quantity, 'increase')}
                     onDecrease={(quantity) => handleStockChange(product.id, quantity, 'decrease')}
                     onEdit={() => setProductForm({ isOpen: true, product })}
                     onDelete={() => setProductToDelete(product)}
                  />
               </li>
            )}
         </ul>

         {(productForm.isOpen === true) &&
            <ProductForm
               key={productForm.product?.id ?? 'new'}
               product={productForm.product ?? undefined}
               productTypes={inventoryStore.productTypes}
               brands={inventoryStore.brands}
               onSubmit={handleSaveProduct}
               onCreateType={handleCreateProductType}
               onClose={() => setProductForm({ isOpen: false, product: null })}
            />
         }

         {(productToDelete !== null) &&
            <DeleteProductModal
               product={productToDelete}
               isDeleting={deletingProductId === productToDelete.id}
               onConfirm={() => handleDeleteProduct(productToDelete)}
               onClose={() => {
                  if (deletingProductId === null) setProductToDelete(null)
               }}
            />
         }
      </main>
   )
}

interface FilterChipProps {
   active: boolean
   label: string
   onClick: () => void
}

function FilterChip({ active, label, onClick }: FilterChipProps) {
   return (
      <button
         className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors ${active ? 'border-white/40 bg-gray-primary text-white' : 'border-gray-primary bg-black-secondary text-gray-400 hover:text-white'}`}
         onClick={onClick}
      >
         {label}
      </button>
   )
}

function normalize(value: string) {
   return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
}
