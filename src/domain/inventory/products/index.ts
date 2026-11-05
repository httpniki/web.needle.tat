import { Product, ProductObject } from '../Product'
import { ProductType } from '../ProductType'
import { findAttributeValue, toProductAttributes } from './attributes'
import Cups, { isCupSize } from './Cups'
import Ink from './Ink'
import LiquidSoap from './LiquidSoap'
import Needle from './Needle'
import NitrileGloves, { isNitrileGloveSize } from './NitrileGloves'
import PenCartridge from './PenCartridge'
import SolidVaseline from './SolidVaseline'
import Stencil from './Stencil'
import TongueDepressor from './TongueDepressor'

export { Cups, Ink, LiquidSoap, Needle, NitrileGloves, PenCartridge, SolidVaseline, Stencil, TongueDepressor }
export type { CupsObject } from './Cups'
export type { InkObject } from './Ink'
export type { LiquidSoapObject } from './LiquidSoap'
export type { NeedleObject } from './Needle'
export type { NitrileGlovesObject } from './NitrileGloves'
export type { PenCartridgeObject } from './PenCartridge'
export type { SolidVaselineObject } from './SolidVaseline'
export type { StencilObject } from './Stencil'
export type { TongueDepressorObject } from './TongueDepressor'

export type ProductKind = 'cups' | 'hectograph-paper' | 'ink' | 'liquid-soap' | 'needle' | 'nitrile-gloves' | 'pen-cartridges' | 'solid-vaseline' | 'stencil' | 'tongue-depressor' | 'default'

export function getProductKind(typeValue?: string): ProductKind {
   const normalized = normalize(typeValue)

   if (normalized === 'ink' || normalized === 'tinta' || normalized === 'tintatattoo' || normalized === 'tattooink') return 'ink'
   if (normalized === 'aguja' || normalized === 'agujas' || normalized === 'needle') return 'needle'
   if (normalized === 'pencartridge' || normalized === 'pencartridges') return 'pen-cartridges'
   if (normalized === 'vaselinasolida' || normalized === 'vaselinasolidas' || normalized === 'solidvaseline') return 'solid-vaseline'
   if (normalized === 'bajalenguas' || normalized === 'bajalengua' || normalized === 'tonguedepressor' || normalized === 'tonguedepressors') return 'tongue-depressor'
   if (normalized === 'jabonliquido' || normalized === 'jabonliquidos' || normalized === 'liquidsoap' || normalized === 'liquidsoaps') return 'liquid-soap'
   if (normalized === 'stencil' || normalized === 'stencils') return 'stencil'
   if (normalized === 'guantesdenitrilo' || normalized === 'guantesnitrilo' || normalized === 'nitrileglove' || normalized === 'nitrilegloves') return 'nitrile-gloves'
   if (normalized === 'tetina' || normalized === 'tetinas' || normalized === 'cup' || normalized === 'cups') return 'cups'
   if (normalized === 'papelhectografico' || normalized === 'papelhectograficos' || normalized === 'hectografico' || normalized === 'hectograficos' || normalized === 'hectographpaper' || normalized === 'hectographicpaper') return 'hectograph-paper'

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
      case 'tongue-depressor':
         return new TongueDepressor({ ...product, type, attributes })
      case 'liquid-soap':
         if (Number(findAttributeValue(attributes, 'liters')) > 0) return new LiquidSoap({ ...product, type, attributes })
         break
      case 'stencil':
         if (Number(findAttributeValue(attributes, 'ml')) > 0) return new Stencil({ ...product, type, attributes })
         break
      case 'nitrile-gloves': {
         const size = findAttributeValue(attributes, 'size')?.trim().toUpperCase() ?? ''
         if (isNitrileGloveSize(size)) return new NitrileGloves({ ...product, type, attributes })
         break
      }
      case 'cups': {
         const size = findAttributeValue(attributes, 'size')?.trim().toUpperCase() ?? ''
         if (isCupSize(size)) return new Cups({ ...product, type, attributes })
         break
      }
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
