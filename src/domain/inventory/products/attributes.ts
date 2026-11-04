import { ProductAttribute, ProductAttributeObject } from '../ProductAttribute'

export function toProductAttributes(attributes: ProductAttributeObject[]): ProductAttribute[] {
   return attributes.map((attribute) => new ProductAttribute({
      attributeId: attribute.attributeId,
      name: attribute.name,
      value: attribute.value
   }))
}

export function findAttributeValue(attributes: ProductAttribute[] | undefined, name: string): string | undefined {
   return attributes?.find((attribute) => attribute.name === name)?.value
}

export function setAttributeValue(attributes: ProductAttribute[] | undefined, name: string, value: string | null): ProductAttribute[] {
   const existing = attributes?.find((attribute) => attribute.name === name)
   const nextAttributes = (attributes ?? [])
      .filter((attribute) => attribute.name !== name)
      .map((attribute) => attribute.clone())

   if (value === null || !value.trim()) return nextAttributes

   nextAttributes.push(new ProductAttribute({
      attributeId: existing?.attributeId ?? 0,
      name,
      value
   }))

   return nextAttributes
}
