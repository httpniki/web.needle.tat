import DomainException from '@/utils/exceptions/domain-exception'

import { Product, ProductObject } from '../Product'
import { ProductAttribute } from '../ProductAttribute'
import { ProductType } from '../ProductType'
import { findAttributeValue, setAttributeValue } from './attributes'

const SIZE_ATTRIBUTE = 'size_oz'
const COLOR_ATTRIBUTE = 'color'
const EXPIRATION_ATTRIBUTE = 'expiration_date'

export interface InkObject extends ProductObject {
   sizeInOz: number
   color: string
   expirationDate: string | null
}

interface InkConstructor {
   id?: number
   name: string
   brand: string
   type: ProductType
   stock?: number
   createdAt?: Date
   attributes?: ProductAttribute[]
   sizeInOz?: number
   color?: string
   expirationDate?: string | null
}

export default class Ink extends Product {
   private _sizeInOz: number = 0
   private _color: string = ''
   private _expirationDate: string | null = null

   constructor(props: InkConstructor) {
      const sizeValue = findAttributeValue(props.attributes, SIZE_ATTRIBUTE)
      const sizeInOz = props.sizeInOz ?? (sizeValue === undefined ? undefined : Number(sizeValue))
      const color = props.color !== undefined
         ? props.color
         : findAttributeValue(props.attributes, COLOR_ATTRIBUTE) ?? ''
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
               setAttributeValue(
                  props.attributes,
                  SIZE_ATTRIBUTE,
                  sizeInOz === undefined ? null : String(sizeInOz)
               ),
               COLOR_ATTRIBUTE,
               color
            ),
            EXPIRATION_ATTRIBUTE,
            expirationDate
         )
      })

      this.sizeInOz = sizeInOz ?? 0
      this.color = color
      this.expirationDate = expirationDate
   }

   public get sizeInOz(): number { return this._sizeInOz; }
   public set sizeInOz(value: number) {
      if (!Number.isFinite(value) || value <= 0) {
         throw new DomainException('sizeInOz', 'El tamaño en onzas debe ser mayor a cero')
      }

      this._sizeInOz = value
   }

   public get color(): string { return this._color; }
   public set color(value: string) {
      const trimmedValue = value.trim()
      if (!trimmedValue) throw new DomainException('color', 'El color de la tinta es obligatorio')
      if (trimmedValue.length > 100) throw new DomainException('color', 'El color de la tinta no puede superar los 100 caracteres')

      this._color = trimmedValue
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

   public clone(): Ink {
      return new Ink({
         id: this.id,
         name: this.name,
         brand: this.brand,
         type: this.type,
         stock: this.stock,
         createdAt: this.createdAt,
         sizeInOz: this.sizeInOz,
         color: this.color,
         expirationDate: this.expirationDate
      })
   }

   public toObject(): InkObject {
      return {
         ...super.toObject(),
         sizeInOz: this.sizeInOz,
         color: this.color,
         expirationDate: this.expirationDate
      }
   }
}
