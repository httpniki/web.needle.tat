import DomainException from '@/utils/exceptions/domain-exception'

import { Product, ProductObject } from '../Product'
import { ProductAttribute } from '../ProductAttribute'
import { ProductType } from '../ProductType'
import { findAttributeValue, setAttributeValue } from './attributes'

const ML_ATTRIBUTE = 'ml'
const EXPIRATION_ATTRIBUTE = 'expiration_date'

export interface StencilObject extends ProductObject {
   milliliters: number
   expirationDate: string | null
}

interface StencilConstructor {
   id?: number
   name: string
   brand: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
   milliliters?: number
   expirationDate?: string | null
}

export default class Stencil extends Product {
   private _milliliters: number = 0
   private _expirationDate: string | null = null

   constructor(props: StencilConstructor) {
      const mlValue = findAttributeValue(props.attributes, ML_ATTRIBUTE)
      const milliliters = props.milliliters ?? (mlValue === undefined ? undefined : Number(mlValue))
      const expirationDate = props.expirationDate !== undefined
         ? props.expirationDate
         : findAttributeValue(props.attributes, EXPIRATION_ATTRIBUTE) ?? null

      super({
         id: props.id,
         name: props.name,
         brand: props.brand,
         type: props.type,
         stock: props.stock,
         createdAt: props.createdAt,
         attributes: setAttributeValue(
            setAttributeValue(
               props.attributes,
               ML_ATTRIBUTE,
               milliliters === undefined ? null : String(milliliters)
            ),
            EXPIRATION_ATTRIBUTE,
            expirationDate
         )
      })

      this.milliliters = milliliters ?? 0
      this.expirationDate = expirationDate
   }

   public get milliliters(): number { return this._milliliters; }
   public set milliliters(value: number) {
      if (!Number.isFinite(value) || value <= 0) {
         throw new DomainException('milliliters', 'La medida en mililitros debe ser mayor a cero')
      }

      this._milliliters = value
   }

   public get expirationDate(): string | null { return this._expirationDate; }
   public set expirationDate(value: string | null) {
      if (!value) {
         this._expirationDate = null
         return
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
         throw new DomainException('expirationDate', 'La fecha de vencimiento no es válida')
      }

      const [year, month, day] = value.split('-').map(Number)
      const date = new Date(`${value}T00:00:00`)

      if (isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
         throw new DomainException('expirationDate', 'La fecha de vencimiento no es válida')
      }

      this._expirationDate = value
   }

   public clone(): Stencil {
      return new Stencil({
         id: this.id,
         name: this.name,
         brand: this.brand,
         type: this.type,
         stock: this.stock,
         createdAt: this.createdAt,
         milliliters: this.milliliters,
         expirationDate: this.expirationDate
      })
   }

   public toObject(): StencilObject {
      return {
         ...super.toObject(),
         milliliters: this.milliliters,
         expirationDate: this.expirationDate
      }
   }
}
