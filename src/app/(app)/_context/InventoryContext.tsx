'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

import Inventory, { InventoryObject } from '@/domain/inventory/Inventory'
import { Product, ProductObject } from '@/domain/inventory/Product'
import { ProductAttribute } from '@/domain/inventory/ProductAttribute'
import { ProductType, ProductTypeObject } from '@/domain/inventory/ProductType'

type ProductInput = Product | ProductObject
type ProductTypeInput = ProductType | ProductTypeObject

interface InventoryStoreState {
   inventory: Inventory
   products: Product[]
   productTypes: ProductType[]
   brands: string[]
   addProduct: (product: ProductInput) => void
   addProductType: (productType: ProductTypeInput) => ProductType
   removeProduct: (productId: number) => void
   findProduct: (productId: number) => Product | undefined
}

interface InventoryProviderProps {
   children: React.ReactNode
   inventory: InventoryObject
}

const InventoryContext = createContext<InventoryStoreState | null>(null)

export default function InventoryProvider(props: InventoryProviderProps) {
   const [inventory, setInventory] = useState<Inventory>(() => toInventory(props.inventory))

   const products = inventory.products
   const productTypes = inventory.productTypes
   const brands = useMemo(() => [...new Set(products.map((product) => product.brand))], [products])

   function addProduct(product: ProductInput) {
      const newProduct = toProduct(product)

      setInventory((current) => {
         const nextInventory = current.clone()
         nextInventory.addProduct(newProduct)

         return nextInventory
      })
   }

   function addProductType(productType: ProductTypeInput): ProductType {
      const newType = toProductType(productType)
      const existingType = productTypes.find((currentType) => normalize(currentType.value) === normalize(newType.value))

      if (existingType) return existingType

      const idExists = newType.id !== 0 && productTypes.some((currentType) => currentType.id === newType.id)
      const nextId = newType.id === 0 || idExists
         ? productTypes.reduce((maxId, currentType) => Math.max(maxId, currentType.id), 0) + 1
         : newType.id
      const createdType = new ProductType({ id: nextId, value: newType.value })

      setInventory((current) => {
         const nextInventory = current.clone()
         nextInventory.productTypes = [...current.productTypes, createdType]

         return nextInventory
      })

      return createdType
   }

   function removeProduct(productId: number) {
      setInventory((current) => {
         const nextInventory = current.clone()
         nextInventory.removeProduct(productId)

         return nextInventory
      })
   }

   function findProduct(productId: number): Product | undefined {
      return inventory.findProduct(productId)
   }

   return (
      <InventoryContext.Provider value={{ inventory, products, productTypes, brands, addProduct, addProductType, removeProduct, findProduct }}>
         {props.children}
      </InventoryContext.Provider>
   )
}

export function useInventory() {
   const context = useContext(InventoryContext)

   if (!context) throw new Error('InventoryContext not found')

   return context
}

function toInventory(inventory: InventoryObject): Inventory {
   return new Inventory({
      products: inventory.products.map(toProduct),
      productTypes: inventory.productTypes.map(toProductType)
   })
}

function toProduct(product: ProductInput): Product {
   if (product instanceof Product) return product

   return new Product({
      ...product,
      type: toProductType(product.type),
      attributes: product.attributes.map((attribute) => new ProductAttribute({
         attributeId: attribute.attributeId,
         name: attribute.name,
         value: attribute.value
      }))
   })
}

function toProductType(productType: ProductTypeInput): ProductType {
   if (productType instanceof ProductType) return productType

   return new ProductType({
      id: productType.id,
      value: productType.value
   })
}

function normalize(value: string) {
   return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
}
