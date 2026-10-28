'use server'

import { cookies } from 'next/headers'

import { InventoryObject } from '@/domain/inventory/Inventory'
import { ProductObject } from '@/domain/inventory/Product'
import { ProductAttributeObject } from '@/domain/inventory/ProductAttribute'
import { ProductTypeObject } from '@/domain/inventory/ProductType'
import { requireArtist } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

import ActionException from '../utils/exceptions/action-exception'

const BRAND_ATTRIBUTE = 'brand'

interface ProductModel {
   product_id: number
   name: string
   stock: number
   created_at: string
   product_type_id: number
}

interface ProductTypeModel {
   product_type_id: number
   value: string
}

interface AttributeModel {
   attribute_id: number
   name: string
}

interface ProductAttributeModel {
   product_id: number
   attribute_id: number
   value: string
}

type DbClient = ReturnType<typeof createClient>

export interface NewProductAttribute {
   name: string
   value: string
}

export interface NewProduct {
   name: string
   brand: string
   stock: number
   typeId: number
   attributes?: NewProductAttribute[]
}

export async function createProduct(body: NewProduct): Promise<ProductObject> {
   await requireArtist()

   const db = createClient(await cookies())

   const name = body.name.trim()
   const brand = body.brand.trim()

   if (!name || name.length > 100) {
      const err = new ActionException('Invalid product name')
      err.name = 'invalid_product_name'
      throw err
   }

   if (!brand || brand.length > 100) {
      const err = new ActionException('Invalid product brand')
      err.name = 'invalid_product_brand'
      throw err
   }

   if (!Number.isInteger(body.stock) || body.stock < 0) {
      const err = new ActionException('Product stock must be a non-negative integer')
      err.name = 'invalid_product_stock'
      throw err
   }

   if (!Number.isInteger(body.typeId) || body.typeId <= 0) {
      const err = new ActionException('Invalid product type')
      err.name = 'invalid_product_type'
      throw err
   }

   const typeResult = await db.from('product_type').select<string, ProductTypeModel>('*').eq('product_type_id', body.typeId).limit(1)

   if (typeResult.error) {
      const err = new ActionException('Unexpected error validating product type')
      err.name = 'unexpected_error'
      throw err
   }

   if (typeResult.data.length === 0) {
      const err = new ActionException('Product type not found')
      err.name = 'product_type_not_found'
      err.data = { typeId: String(body.typeId) }
      throw err
   }

   const customAttributes = new Map<string, string>()

   for (const attribute of body.attributes ?? []) {
      const attributeName = attribute.name.trim()
      const attributeValue = attribute.value.trim()

      if (!attributeName || !attributeValue || attributeName.length > 100) {
         const err = new ActionException('Invalid product attribute')
         err.name = 'invalid_product_attribute'
         throw err
      }

      if (attributeName === BRAND_ATTRIBUTE) continue

      customAttributes.set(attributeName, attributeValue)
   }

   const result = await db
      .from('products')
      .insert({ name, stock: body.stock, product_type_id: body.typeId })
      .select<string, ProductModel>('*')
      .single()

   if (result.error || !result.data) {
      const err = new ActionException('Unexpected error creating product')
      err.name = 'unexpected_error'
      throw err
   }

   try {
      await saveProductAttributes(db, result.data.product_id, [
         { name: BRAND_ATTRIBUTE, value: brand },
         ...Array.from(customAttributes, ([attributeName, value]) => ({ name: attributeName, value }))
      ])
   } catch (error) {
      await db.from('products').delete().eq('product_id', result.data.product_id)

      throw error
   }

   return findProductById(result.data.product_id)
}

export async function getInventory(): Promise<InventoryObject> {
   const db = createClient(await cookies())

   const [productsResult, typesResult, attributesResult, productAttributesResult] = await Promise.all([
      db.from('products').select<string, ProductModel>('*').order('name'),
      db.from('product_type').select<string, ProductTypeModel>('*').order('value'),
      db.from('attributes').select<string, AttributeModel>('attribute_id, name'),
      db.from('product_attributes').select<string, ProductAttributeModel>('*')
   ])

   if (productsResult.error || typesResult.error || attributesResult.error || productAttributesResult.error) {
      const err = new ActionException('Unexpected error getting inventory')
      err.name = 'unexpected_error'
      throw err
   }

   const typesById = new Map(typesResult.data.map((type) => [type.product_type_id, type]))
   const attributeNamesById = new Map(attributesResult.data.map((attribute) => [attribute.attribute_id, attribute.name]))
   const attributesByProductId = new Map<number, ProductAttributeObject[]>()

   for (const productAttribute of productAttributesResult.data) {
      const attribute = toProductAttribute(productAttribute, attributeNamesById)
      if (!attribute) continue

      const productAttributes = attributesByProductId.get(productAttribute.product_id) ?? []
      attributesByProductId.set(productAttribute.product_id, [...productAttributes, attribute])
   }

   return {
      products: productsResult.data.map((product) => toProductObject(
         product,
         typesById.get(product.product_type_id),
         attributesByProductId.get(product.product_id) ?? []
      )),
      productTypes: typesResult.data.map((type) => ({ id: type.product_type_id, value: type.value }))
   }
}

async function findProductById(id: number): Promise<ProductObject> {
   const db = createClient(await cookies())

   const productResult = await db.from('products').select<string, ProductModel>('*').eq('product_id', id).limit(1)

   if (productResult.error) {
      const err = new ActionException('Unexpected error finding product')
      err.name = 'unexpected_error'
      throw err
   }

   if (productResult.data.length === 0) {
      const err = new ActionException('Product not found')
      err.name = 'product_not_found'
      err.data = { id: String(id) }
      throw err
   }

   const product = productResult.data[0]

   const [typeResult, attributesResult, productAttributesResult] = await Promise.all([
      db.from('product_type').select<string, ProductTypeModel>('*').eq('product_type_id', product.product_type_id).limit(1),
      db.from('attributes').select<string, AttributeModel>('attribute_id, name'),
      db.from('product_attributes').select<string, ProductAttributeModel>('*').eq('product_id', id)
   ])

   if (typeResult.error || attributesResult.error || productAttributesResult.error) {
      const err = new ActionException('Unexpected error finding product')
      err.name = 'unexpected_error'
      throw err
   }

   const attributeNamesById = new Map(attributesResult.data.map((attribute) => [attribute.attribute_id, attribute.name]))
   const attributes = productAttributesResult.data
      .map((productAttribute) => toProductAttribute(productAttribute, attributeNamesById))
      .filter((attribute): attribute is ProductAttributeObject => attribute !== undefined)

   return toProductObject(product, typeResult.data[0], attributes)
}

async function updateProductStock(id: number, stock: number): Promise<ProductObject> {
   const db = createClient(await cookies())

   if (!Number.isInteger(stock) || stock < 0) {
      const err = new ActionException('Product stock must be a non-negative integer')
      err.name = 'invalid_product_stock'
      throw err
   }

   const result = await db.from('products').update({ stock }).eq('product_id', id).select('product_id')

   if (result.error) {
      const err = new ActionException('Unexpected error updating product stock')
      err.name = 'unexpected_error'
      throw err
   }

   if (result.data.length === 0) {
      const err = new ActionException('Product not found')
      err.name = 'product_not_found'
      err.data = { id: String(id) }
      throw err
   }

   return findProductById(id)
}

export async function increaseProductStock(id: number, quantity: number = 1): Promise<ProductObject> {
   await requireArtist()

   if (!Number.isInteger(quantity) || quantity <= 0) {
      const err = new ActionException('Quantity must be a positive integer')
      err.name = 'invalid_quantity'
      throw err
   }

   const product = await findProductById(id)
   return updateProductStock(id, product.stock + quantity)
}

export async function decreaseProductStock(id: number, quantity: number = 1): Promise<ProductObject> {
   await requireArtist()

   if (!Number.isInteger(quantity) || quantity <= 0) {
      const err = new ActionException('Quantity must be a positive integer')
      err.name = 'invalid_quantity'
      throw err
   }

   const product = await findProductById(id)

   if (quantity > product.stock) {
      const err = new ActionException('Not enough stock')
      err.name = 'insufficient_stock'
      err.data = { id: String(id), available: String(product.stock), requested: String(quantity) }
      throw err
   }

   return updateProductStock(id, product.stock - quantity)
}

export async function deleteProduct(id: number): Promise<void> {
   await requireArtist()

   const db = createClient(await cookies())

   await findProductById(id)

   const { error } = await db.from('products').delete().eq('product_id', id)

   if (error) {
      const err = new ActionException('Unexpected error deleting product')
      err.name = 'unexpected_error'
      throw err
   }
}

export async function createProductType(value: string): Promise<ProductTypeObject> {
   await requireArtist()

   const db = createClient(await cookies())
   const normalizedValue = value.trim()

   if (!normalizedValue || normalizedValue.length > 100) {
      const err = new ActionException('Invalid product type')
      err.name = 'invalid_product_type'
      throw err
   }

   const existingResult = await db.from('product_type').select<string, ProductTypeModel>('*').eq('value', normalizedValue).limit(1)

   if (existingResult.error) {
      const err = new ActionException('Unexpected error validating product type')
      err.name = 'unexpected_error'
      throw err
   }

   if (existingResult.data.length > 0) {
      const err = new ActionException('Product type already exists')
      err.name = 'product_type_exists'
      err.data = { value: normalizedValue }
      throw err
   }

   const result = await db.from('product_type').insert({ value: normalizedValue }).select<string, ProductTypeModel>('*').single()

   if (result.error || !result.data) {
      if (result.error?.code === '23505') {
         const err = new ActionException('Product type already exists')
         err.name = 'product_type_exists'
         err.data = { value: normalizedValue }
         throw err
      }

      const err = new ActionException('Unexpected error creating product type')
      err.name = 'unexpected_error'
      throw err
   }

   return { id: result.data.product_type_id, value: result.data.value }
}

async function saveProductAttributes(db: DbClient, productId: number, entries: NewProductAttribute[]): Promise<void> {
   if (entries.length === 0) return

   const names = [...new Set(entries.map((entry) => entry.name))]
   const existingResult = await db.from('attributes').select<string, AttributeModel>('attribute_id, name').in('name', names)

   if (existingResult.error) {
      const err = new ActionException('Unexpected error resolving attributes')
      err.name = 'unexpected_error'
      throw err
   }

   const attributeIds = new Map(existingResult.data.map((attribute) => [attribute.name, attribute.attribute_id]))
   const missingNames = names.filter((name) => !attributeIds.has(name))

   if (missingNames.length > 0) {
      const insertResult = await db
         .from('attributes')
         .insert(missingNames.map((name) => ({ name })))
         .select<string, AttributeModel>('attribute_id, name')

      if (insertResult.error || !insertResult.data) {
         const err = new ActionException('Unexpected error creating attributes')
         err.name = 'unexpected_error'
         throw err
      }

      insertResult.data.forEach((attribute) => attributeIds.set(attribute.name, attribute.attribute_id))
   }

   const rows = entries.map((entry) => {
      const attributeId = attributeIds.get(entry.name)

      if (attributeId === undefined) {
         const err = new ActionException('Unexpected error resolving product attributes')
         err.name = 'unexpected_error'
         throw err
      }

      return { product_id: productId, attribute_id: attributeId, value: entry.value }
   })

   const { error } = await db.from('product_attributes').upsert(rows, { onConflict: 'product_id,attribute_id' })

   if (error) {
      const err = new ActionException('Unexpected error saving product attributes')
      err.name = 'unexpected_error'
      throw err
   }
}

function toProductAttribute(productAttribute: ProductAttributeModel, attributeNamesById: Map<number, string>): ProductAttributeObject | undefined {
   const name = attributeNamesById.get(productAttribute.attribute_id)
   if (!name) return undefined

   return { attributeId: productAttribute.attribute_id, name, value: productAttribute.value }
}

function toProductObject(product: ProductModel, type: ProductTypeModel | undefined, attributes: ProductAttributeObject[]): ProductObject {
   const brand = attributes.find((attribute) => attribute.name === BRAND_ATTRIBUTE)?.value ?? ''

   return {
      id: product.product_id, name: product.name, brand, stock: product.stock,
      type: type ? { id: type.product_type_id, value: type.value } : { id: product.product_type_id, value: '' },
      createdAt: new Date(product.created_at),
      attributes: attributes.filter((attribute) => attribute.name !== BRAND_ATTRIBUTE)
   }
}
