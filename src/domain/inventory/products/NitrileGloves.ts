import DomainException from '@/utils/exceptions/domain-exception'

import { Product, ProductObject } from '../Product'
import { ProductAttribute } from '../ProductAttribute'
import { ProductType } from '../ProductType'
import { findAttributeValue, setAttributeValue } from './attributes'

const SIZE_ATTRIBUTE = 'size'
const EXPIRATION_ATTRIBUTE = 'expiration_date'

export const NITRILE_GLOVE_SIZES = ['S', 'M', 'L', 'XL'] as const

export type NitrileGloveSize = typeof NITRILE_GLOVE_SIZES[number]

export function isNitrileGloveSize(value: string): value is NitrileGloveSize {
   return NITRILE_GLOVE_SIZES.includes(value as NitrileGloveSize)
}

export interface NitrileGlovesObject extends ProductObject {
   size: NitrileGloveSize
   expirationDate: string | null
}

interface NitrileGlovesConstructor {
   id?: number
   name: string
   brand?: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
   size?: string
   expirationDate?: string | null
}

export default class NitrileGloves extends Product {
   private _size: NitrileGloveSize = 'M'
   private _expirationDate: string | null = null

   constructor(props: NitrileGlovesConstructor) {
      const sizeValue = props.size ?? findAttributeValue(props.attributes, SIZE_ATTRIBUTE) ?? ''
      const size = sizeValue.trim().toUpperCase()
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
            setAttributeValue(props.attributes, SIZE_ATTRIBUTE, size),
            EXPIRATION_ATTRIBUTE,
            expirationDate
         )
      })

      this.size = size
      this.expirationDate = expirationDate
   }

   public get size(): NitrileGloveSize { return this._size; }
   public set size(value: string) {
      const normalizedValue = value.trim().toUpperCase()

      if (!isNitrileGloveSize(normalizedValue)) {
         throw new DomainException('size', 'La medida de los guantes no es válida')
      }

      this._size = normalizedValue
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

   public clone(): NitrileGloves {
      return new NitrileGloves({
         id: this.id,
         name: this.name,
         brand: this.brand,
         type: this.type,
         stock: this.stock,
         createdAt: this.createdAt,
         size: this.size,
         expirationDate: this.expirationDate
      })
   }

   public toObject(): NitrileGlovesObject {
      return {
         ...super.toObject(),
         size: this.size,
         expirationDate: this.expirationDate
      }
   }
}
