import DomainException from '@/utils/exceptions/domain-exception'

import { Product, ProductObject } from '../Product'
import { ProductAttribute } from '../ProductAttribute'
import { ProductType } from '../ProductType'
import { findAttributeValue, setAttributeValue } from './attributes'

const QUANTITY_ATTRIBUTE = 'quantity_g'

export interface SolidVaselineObject extends ProductObject {
   quantityInGrams: number
}

interface SolidVaselineConstructor {
   id?: number
   name: string
   brand: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
   quantityInGrams?: number
}

export default class SolidVaseline extends Product {
   private _quantityInGrams: number = 0

   constructor(props: SolidVaselineConstructor) {
      const attributeValue = findAttributeValue(props.attributes, QUANTITY_ATTRIBUTE)
      const quantityInGrams = props.quantityInGrams ?? (attributeValue === undefined ? undefined : Number(attributeValue))

      super({
         id: props.id,
         name: props.name,
         brand: props.brand,
         type: props.type,
         stock: props.stock,
         createdAt: props.createdAt,
         attributes: setAttributeValue(
            props.attributes,
            QUANTITY_ATTRIBUTE,
            quantityInGrams === undefined ? null : String(quantityInGrams)
         )
      })

      this.quantityInGrams = quantityInGrams ?? 0
   }

   public get quantityInGrams(): number { return this._quantityInGrams; }
   public set quantityInGrams(value: number) {
      if (!Number.isFinite(value) || value <= 0) {
         throw new DomainException('quantityInGrams', 'La cantidad en gramos debe ser mayor a cero')
      }

      this._quantityInGrams = value
   }

   public clone(): SolidVaseline {
      return new SolidVaseline({
         id: this.id,
         name: this.name,
         brand: this.brand,
         type: this.type,
         stock: this.stock,
         createdAt: this.createdAt,
         quantityInGrams: this.quantityInGrams
      })
   }

   public toObject(): SolidVaselineObject {
      return {
         ...super.toObject(),
         quantityInGrams: this.quantityInGrams
      }
   }
}
