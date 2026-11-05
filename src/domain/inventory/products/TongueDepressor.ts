import DomainException from '@/utils/exceptions/domain-exception'

import { Product, ProductObject } from '../Product'
import { ProductAttribute } from '../ProductAttribute'
import { ProductType } from '../ProductType'
import { findAttributeValue, setAttributeValue } from './attributes'

const EXPIRATION_ATTRIBUTE = 'expiration_date'

export interface TongueDepressorObject extends ProductObject {
   expirationDate: string | null
}

interface TongueDepressorConstructor {
   id?: number
   name: string
   brand?: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
   expirationDate?: string | null
}

export default class TongueDepressor extends Product {
   private _expirationDate: string | null = null

   constructor(props: TongueDepressorConstructor) {
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
         attributes: setAttributeValue(props.attributes, EXPIRATION_ATTRIBUTE, expirationDate)
      })

      this.expirationDate = expirationDate
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

   public clone(): TongueDepressor {
      return new TongueDepressor({
         id: this.id,
         name: this.name,
         brand: this.brand,
         type: this.type,
         stock: this.stock,
         createdAt: this.createdAt,
         expirationDate: this.expirationDate
      })
   }

   public toObject(): TongueDepressorObject {
      return {
         ...super.toObject(),
         expirationDate: this.expirationDate
      }
   }
}
