import DomainException from '@/utils/exceptions/domain-exception'

import { Product, ProductObject } from '../Product'
import { ProductAttribute } from '../ProductAttribute'
import { ProductType } from '../ProductType'
import { findAttributeValue, setAttributeValue } from './attributes'

const MEASURE_ATTRIBUTE = 'measure'
const EXPIRATION_ATTRIBUTE = 'expiration_date'

export interface PenCartridgeObject extends ProductObject {
   measure: string
   expirationDate: string | null
}

interface PenCartridgeConstructor {
   id?: number
   name: string
   brand: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
   measure?: string
   expirationDate?: string | null
}

export default class PenCartridge extends Product {
   private _measure: string = ''
   private _expirationDate: string | null = null

   constructor(props: PenCartridgeConstructor) {
      const measure = props.measure !== undefined
         ? props.measure
         : findAttributeValue(props.attributes, MEASURE_ATTRIBUTE) ?? ''
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
            setAttributeValue(props.attributes, MEASURE_ATTRIBUTE, measure),
            EXPIRATION_ATTRIBUTE,
            expirationDate
         )
      })

      this.measure = measure
      this.expirationDate = expirationDate
   }

   public get measure(): string { return this._measure; }
   public set measure(value: string) {
      const trimmedValue = value.trim()
      if (!trimmedValue) throw new DomainException('measure', 'La medida del cartucho es obligatoria')
      if (trimmedValue.length > 100) throw new DomainException('measure', 'La medida del cartucho no puede superar los 100 caracteres')

      this._measure = trimmedValue
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

   public clone(): PenCartridge {
      return new PenCartridge({
         id: this.id,
         name: this.name,
         brand: this.brand,
         type: this.type,
         stock: this.stock,
         createdAt: this.createdAt,
         measure: this.measure,
         expirationDate: this.expirationDate
      })
   }

   public toObject(): PenCartridgeObject {
      return {
         ...super.toObject(),
         measure: this.measure,
         expirationDate: this.expirationDate
      }
   }
}
