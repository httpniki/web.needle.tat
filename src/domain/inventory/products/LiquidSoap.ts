import DomainException from '@/utils/exceptions/domain-exception'

import { Product, ProductObject } from '../Product'
import { ProductAttribute } from '../ProductAttribute'
import { ProductType } from '../ProductType'
import { findAttributeValue, setAttributeValue } from './attributes'

const LITERS_ATTRIBUTE = 'liters'
const EXPIRATION_ATTRIBUTE = 'expiration_date'

export interface LiquidSoapObject extends ProductObject {
   liters: number
   expirationDate: string | null
}

interface LiquidSoapConstructor {
   id?: number
   name: string
   brand?: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
   liters?: number
   expirationDate?: string | null
}

export default class LiquidSoap extends Product {
   private _liters: number = 0
   private _expirationDate: string | null = null

   constructor(props: LiquidSoapConstructor) {
      const litersValue = findAttributeValue(props.attributes, LITERS_ATTRIBUTE)
      const liters = props.liters ?? (litersValue === undefined ? undefined : Number(litersValue))
      const expirationDate = props.expirationDate !== undefined
         ? props.expirationDate
         : findAttributeValue(props.attributes, EXPIRATION_ATTRIBUTE) ?? null

      super({
         id: props.id,
         name: props.name,
         brand: props.brand ?? '',
         type: props.type,
         stock: props.stock,
         createdAt: props.createdAt,
         attributes: setAttributeValue(
            setAttributeValue(
               props.attributes,
               LITERS_ATTRIBUTE,
               liters === undefined ? null : String(liters)
            ),
            EXPIRATION_ATTRIBUTE,
            expirationDate
         )
      })

      this.liters = liters ?? 0
      this.expirationDate = expirationDate
   }

   public get liters(): number { return this._liters; }
   public set liters(value: number) {
      if (!Number.isFinite(value) || value <= 0) {
         throw new DomainException('liters', 'La medida en litros debe ser mayor a cero')
      }

      this._liters = value
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

   public clone(): LiquidSoap {
      return new LiquidSoap({
         id: this.id,
         name: this.name,
         brand: this.brand,
         type: this.type,
         stock: this.stock,
         createdAt: this.createdAt,
         liters: this.liters,
         expirationDate: this.expirationDate
      })
   }

   public toObject(): LiquidSoapObject {
      return {
         ...super.toObject(),
         liters: this.liters,
         expirationDate: this.expirationDate
      }
   }
}
