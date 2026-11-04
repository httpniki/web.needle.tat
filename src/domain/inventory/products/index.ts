import { Product, ProductObject } from '../Product'
import { ProductType } from '../ProductType'
import { findAttributeValue, toProductAttributes } from './attributes'
import Ink from './Ink'
import Needle from './Needle'
import PenCartridge from './PenCartridge'
import SolidVaseline from './SolidVaseline'

export { Ink, Needle, PenCartridge, SolidVaseline }
export type { InkObject } from './Ink'
export type { NeedleObject } from './Needle'
export type { PenCartridgeObject } from './PenCartridge'
export type { SolidVaselineObject } from './SolidVaseline'

export type ProductKind = 'ink' | 'needle' | 'pen-cartridges' | 'solid-vaseline' | 'default'

export function getProductKind(typeValue?: string): ProductKind {
   const normalized = normalize(typeValue)

   if (normalized === 'ink' || normalized === 'tinta' || normalized === 'tintatattoo' || normalized === 'tattooink') return 'ink'
   if (normalized === 'aguja' || normalized === 'agujas' || normalized === 'needle') return 'needle'
   if (normalized === 'pencartridge' || normalized === 'pencartridges') return 'pen-cartridges'
   if (normalized === 'vaselinasolida' || normalized === 'vaselinasolidas' || normalized === 'solidvaseline') return 'solid-vaseline'

   return 'default'
}

export function createProductFromObject(product: ProductObject): Product {
   const type = new ProductType(product.type)
   const attributes = toProductAttributes(product.attributes)

   switch (getProductKind(type.value)) {
      case 'ink':
         if (Number(findAttributeValue(attributes, 'size_oz')) > 0 && findAttributeValue(attributes, 'color')?.trim()) {
            return new Ink({ ...product, type, attributes })
         }
         break
      case 'needle':
         if (findAttributeValue(attributes, 'measure')?.trim()) return new Needle({ ...product, type, attributes })
         break
      case 'pen-cartridges':
         if (findAttributeValue(attributes, 'measure')?.trim()) return new PenCartridge({ ...product, type, attributes })
         break
      case 'solid-vaseline':
         if (Number(findAttributeValue(attributes, 'quantity_g')) > 0) return new SolidVaseline({ ...product, type, attributes })
         break
   }

   return new Product({ ...product, type, attributes })
}

function normalize(value?: string): string {
   return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
}
