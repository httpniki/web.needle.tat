import DomainException from '@/utils/exceptions/domain-exception'

import { Product, ProductObject } from '../Product'
import { ProductAttribute } from '../ProductAttribute'
import { ProductType } from '../ProductType'
import { findAttributeValue, setAttributeValue } from './attributes'

const SIZE_ATTRIBUTE = 'size'

export const CUP_SIZES = ['SM', 'MD', 'L'] as const

export type CupSize = typeof CUP_SIZES[number]

export function isCupSize(value: string): value is CupSize {
   return CUP_SIZES.includes(value as CupSize)
}

export interface CupsObject extends ProductObject {
   size: CupSize
}

interface CupsConstructor {
   id?: number
   name: string
   brand?: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
   size?: string
}

export default class Cups extends Product {
   private _size: CupSize = 'MD'

   constructor(props: CupsConstructor) {
      const sizeValue = props.size ?? findAttributeValue(props.attributes, SIZE_ATTRIBUTE) ?? ''
      const size = sizeValue.trim().toUpperCase()

      super({
         id: props.id,
         name: props.name,
         brand: props.brand ?? '',
         type: props.type,
         stock: props.stock,
         createdAt: props.createdAt,
         attributes: setAttributeValue(props.attributes, SIZE_ATTRIBUTE, size)
      })

      this.size = size
   }

   public get size(): CupSize { return this._size; }
   public set size(value: string) {
      const normalizedValue = value.trim().toUpperCase()

      if (!isCupSize(normalizedValue)) {
         throw new DomainException('size', 'La medida de las tetinas no es válida')
      }

      this._size = normalizedValue
   }

   public clone(): Cups {
      return new Cups({
         id: this.id,
         name: this.name,
         brand: this.brand,
         type: this.type,
         stock: this.stock,
         createdAt: this.createdAt,
         size: this.size
      })
   }

   public toObject(): CupsObject {
      return {
         ...super.toObject(),
         size: this.size
      }
   }
}
