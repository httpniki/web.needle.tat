import DomainException from '@/utils/exceptions/domain-exception'

export interface IProductType {
   id: number
   value: string
   clone(): ProductType
   toObject(): ProductTypeObject
}

export interface ProductTypeObject {
   id: number
   value: string
}

interface ProductTypeConstructor {
   id?: number
   value: string
}

export class ProductType implements IProductType {
   private _id: number = 0
   private _value: string = ''

   constructor(props?: ProductTypeConstructor) {
      if (!props) return

      if (props.id !== undefined) this.id = props.id
      this.value = props.value
   }

   public get id(): number { return this._id; }
   public set id(value: number) {
      if (!Number.isInteger(value) || value < 0) throw new DomainException('id', 'El id del tipo de producto no es válido')
      this._id = value
   }

   public get value(): string { return this._value; }
   public set value(value: string) {
      const trimmedValue = value.trim()
      if (!trimmedValue) throw new DomainException('value', 'El tipo de producto no puede estar vacío')
      if (trimmedValue.length > 100) throw new DomainException('value', 'El tipo de producto no puede superar los 100 caracteres')

      this._value = trimmedValue
   }

   public clone(): ProductType {
      return new ProductType({
         id: this._id,
         value: this._value
      })
   }

   public toObject(): ProductTypeObject {
      return {
         id: this._id,
         value: this._value
      }
   }
}
