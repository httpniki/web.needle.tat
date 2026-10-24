import DomainException from '@/utils/exceptions/domain-exception'

import { ProductAttribute, ProductAttributeObject } from './ProductAttribute'
import { ProductType, ProductTypeObject } from './ProductType'

const DEFAULT_LOW_STOCK_THRESHOLD = 5

export interface IProduct {
   id: number
   name: string
   brand: string
   type: ProductType
   stock: number
   createdAt: Date
   attributes: ProductAttribute[]
   clone(): Product
   toObject(): ProductObject
   isLowStock(threshold?: number): boolean
   increaseStock(quantity?: number): void
   decreaseStock(quantity?: number): void
   findAttribute(name: string): ProductAttribute | undefined
}

export interface ProductObject {
   id: number
   name: string
   brand: string
   type: ProductTypeObject
   stock: number
   createdAt: Date
   attributes: ProductAttributeObject[]
}

interface ProductConstructor {
   id?: number
   name: string
   brand: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
}

export class Product implements IProduct {
   private _id: number = 0
   private _name: string = ''
   private _brand: string = ''
   private _type: ProductType = new ProductType()
   private _stock: number = 0
   private _createdAt: Date = new Date()
   private _attributes: ProductAttribute[] = []

   constructor(props?: ProductConstructor) {
      if (!props) return

      if (props.id !== undefined) this.id = props.id
      this.name = props.name
      this.brand = props.brand
      this.type = props.type
      if (props.stock !== undefined) this.stock = props.stock
      if (props.createdAt) this.createdAt = props.createdAt
      if (props.attributes) this.attributes = props.attributes
   }

   public get id(): number { return this._id; }
   public set id(value: number) {
      if (!Number.isInteger(value) || value < 0) throw new DomainException('id', 'El id del producto no es válido')
      this._id = value
   }

   public get name(): string { return this._name; }
   public set name(value: string) {
      const trimmedValue = value.trim()
      if (!trimmedValue) throw new DomainException('name', 'El nombre del producto no puede estar vacío')
      if (trimmedValue.length > 100) throw new DomainException('name', 'El nombre del producto no puede superar los 100 caracteres')

      this._name = trimmedValue
   }

   public get brand(): string { return this._brand; }
   public set brand(value: string) {
      const trimmedValue = value.trim()
      if (!trimmedValue) throw new DomainException('brand', 'La marca del producto es obligatoria')
      if (trimmedValue.length > 100) throw new DomainException('brand', 'La marca del producto no puede superar los 100 caracteres')

      this._brand = trimmedValue
   }

   public get type(): ProductType { return this._type; }
   public set type(value: ProductType) {
      if (!(value instanceof ProductType)) throw new DomainException('type', 'El tipo de producto es obligatorio')
      if (!value.value) throw new DomainException('type', 'El tipo de producto es obligatorio')

      this._type = value.clone()
   }

   public get stock(): number { return this._stock; }
   public set stock(value: number) {
      if (!Number.isInteger(value)) throw new DomainException('stock', 'El stock debe ser un número entero')
      if (value < 0) throw new DomainException('stock', 'El stock no puede ser negativo')

      this._stock = value
   }

   public get createdAt(): Date { return this._createdAt; }
   public set createdAt(value: Date) {
      if (!(value instanceof Date) || isNaN(value.getTime())) {
         throw new DomainException('createdAt', 'La fecha de creación no es válida')
      }

      this._createdAt = new Date(value)
   }

   public get attributes(): ProductAttribute[] { return this._attributes; }
   public set attributes(value: ProductAttribute[]) {
      if (!Array.isArray(value) || value.some((attribute) => !(attribute instanceof ProductAttribute))) {
         throw new DomainException('attributes', 'Los atributos del producto no son válidos')
      }

      this._attributes = value.map((attribute) => attribute.clone())
   }

   public clone(): Product {
      return new Product({
         id: this._id,
         name: this._name,
         brand: this._brand,
         type: this._type,
         stock: this._stock,
         createdAt: this._createdAt,
         attributes: this._attributes
      })
   }

   public toObject(): ProductObject {
      return {
         id: this._id,
         name: this._name,
         brand: this._brand,
         type: this._type.toObject(),
         stock: this._stock,
         createdAt: this._createdAt,
         attributes: this._attributes.map((attribute) => attribute.toObject())
      }
   }

   public isLowStock(threshold: number = DEFAULT_LOW_STOCK_THRESHOLD): boolean {
      return this._stock <= threshold
   }

   public increaseStock(quantity: number = 1): void {
      assertPositiveQuantity(quantity)
      this._stock += quantity
   }

   public decreaseStock(quantity: number = 1): void {
      assertPositiveQuantity(quantity)

      if (quantity > this._stock) {
         throw new DomainException('stock', `No hay stock suficiente: disponible ${this._stock}, solicitado ${quantity}`)
      }

      this._stock -= quantity
   }

   public findAttribute(name: string): ProductAttribute | undefined {
      return this._attributes.find((attribute) => attribute.name === name)
   }
}

function assertPositiveQuantity(quantity: number): void {
   if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainException('quantity', 'La cantidad debe ser un número entero mayor a cero')
   }
}
