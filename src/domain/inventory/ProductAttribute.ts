import DomainException from '@/utils/exceptions/domain-exception'

export interface IProductAttribute {
   attributeId: number
   name: string
   value: string
   clone(): ProductAttribute
   toObject(): ProductAttributeObject
}

export interface ProductAttributeObject {
   attributeId: number
   name: string
   value: string
}

interface ProductAttributeConstructor {
   attributeId: number
   name: string
   value: string
}

export class ProductAttribute implements IProductAttribute {
   private _attributeId: number = 0
   private _name: string = ''
   private _value: string = ''

   constructor(props?: ProductAttributeConstructor) {
      if (!props) return

      this.attributeId = props.attributeId
      this.name = props.name
      this.value = props.value
   }

   public get attributeId(): number { return this._attributeId; }
   public set attributeId(value: number) {
      if (!Number.isInteger(value) || value < 0) throw new DomainException('attributeId', 'El id del atributo no es válido')
      this._attributeId = value
   }

   public get name(): string { return this._name; }
   public set name(value: string) {
      const trimmedValue = value.trim()
      if (!trimmedValue) throw new DomainException('name', 'El nombre del atributo no puede estar vacío')
      if (trimmedValue.length > 100) throw new DomainException('name', 'El nombre del atributo no puede superar los 100 caracteres')

      this._name = trimmedValue
   }

   public get value(): string { return this._value; }
   public set value(value: string) {
      const trimmedValue = value.trim()
      if (!trimmedValue) throw new DomainException('value', 'El valor del atributo no puede estar vacío')

      this._value = trimmedValue
   }

   public clone(): ProductAttribute {
      return new ProductAttribute({
         attributeId: this._attributeId,
         name: this._name,
         value: this._value
      })
   }

   public toObject(): ProductAttributeObject {
      return {
         attributeId: this._attributeId,
         name: this._name,
         value: this._value
      }
   }
}
