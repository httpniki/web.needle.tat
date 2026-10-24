'use client'

import { useMemo, useState } from 'react'

import { createProduct, createProductType, decreaseProductStock, deleteProduct, increaseProductStock } from '@/actions/inventory-actions'
import { useInventory } from '@/app/_context/InventoryContext'
import { useToast } from '@/app/_context/ToastContext'
import SearchBar from '@/components/ui/SearchBar'
import { Product } from '@/domain/inventory/Product'

import DeleteProductModal from './_components/DeleteProductModal'
import NewProductForm from './_components/NewProductForm'
import ProductCard from './_components/ProductCard'

export default function InventoryPage() {
   const inventoryStore = useInventory()
   const toast = useToast()

   const [searchQuery, setSearchQuery] = useState('')
   const [typeFilter, setTypeFilter] = useState<number | null>(null)

   const [isAddingProduct, setIsAddingProduct] = useState(false)

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

   async function handleAddProduct(product: Product) {
      try {
         let typeId = product.type.id

         if (typeId === 0) {
            const existingType = inventoryStore.productTypes.find((type) => normalize(type.value) === normalize(product.type.value))

            if (existingType) typeId = existingType.id

            if (!existingType) {
               const createdType = await createProductType(product.type.value)
               typeId = inventoryStore.addProductType(createdType).id
            }
         }

         const createdProduct = await createProduct({
            name: product.name,
            brand: product.brand,
            stock: product.stock,
            typeId
         })

         inventoryStore.addProduct(createdProduct)
         setIsAddingProduct(false)
      } catch (error: unknown) {
         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: 'No se pudo agregar el producto.', type: 'error' })
      }
   }

   async function handleStockChange(productId: number, quantity: number, operation: 'increase' | 'decrease') {
      if (updatingStockProductId !== null || deletingProductId !== null) return

      setUpdatingStockProductId(productId)

      try {
         const updatedProduct = operation === 'increase'
            ? await increaseProductStock(productId, quantity)
            : await decreaseProductStock(productId, quantity)

         inventoryStore.addProduct(updatedProduct)
      } catch (error: unknown) {
         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: 'No se pudo actualizar el stock.', type: 'error' })
      } finally {
         setUpdatingStockProductId(null)
      }
   }

   async function handleDeleteProduct(product: Product) {
      if (deletingProductId !== null || updatingStockProductId !== null) return
      setDeletingProductId(product.id)

      try {
         await deleteProduct(product.id)

         inventoryStore.removeProduct(product.id)
         setProductToDelete(null)
      } catch (error: unknown) {
         if (error instanceof Error && error.message) toast.add({ title: 'Error', message: error.message, type: 'error' })
         else toast.add({ title: 'Error', message: 'No se pudo eliminar el producto.', type: 'error' })
      } finally {
         setDeletingProductId(null)
      }
   }

   return (
      <main className='flex w-full flex-col gap-4 p-4 md:px-8'>
         <header className='mt-4 flex items-start justify-between gap-4'>
            <div className='flex flex-col gap-1'>
               <h1 className='text-2xl font-bold'>
                  Stock
               </h1>

               <p className='text-sm text-gray-400'>
                  Inventario de insumos y materiales del estudio.
               </p>
            </div>

            <button
               className='flex shrink-0 cursor-pointer items-center gap-2 rounded-md border bg-gray-primary px-3 py-2 text-sm text-white transition-opacity hover:opacity-80'
               onClick={() => setIsAddingProduct(true)}
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="1em" height="1em">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
               </svg>

               Agregar producto
            </button>
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
         </section>

         {filteredProducts.length === 0 &&
            <p className='text-sm text-gray-400'>
               No se encontraron productos.
            </p>
         }

         <ul className='grid gap-2 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]'>
            {filteredProducts.map((product) =>
               <li key={product.id}>
                  <ProductCard
                     product={product}
                     isUpdating={updatingStockProductId === product.id}
                     isDeleting={deletingProductId === product.id}
                     onIncrease={(quantity) => handleStockChange(product.id, quantity, 'increase')}
                     onDecrease={(quantity) => handleStockChange(product.id, quantity, 'decrease')}
                     onDelete={() => setProductToDelete(product)}
                  />
               </li>
            )}
         </ul>

         {isAddingProduct &&
            <NewProductForm
               productTypes={inventoryStore.productTypes}
               onAdd={handleAddProduct}
               onClose={() => setIsAddingProduct(false)}
            />
         }

         {productToDelete &&
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
