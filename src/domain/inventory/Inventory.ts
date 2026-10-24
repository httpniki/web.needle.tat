import { Product, ProductObject } from '@/domain/inventory/Product'
import { ProductType, ProductTypeObject } from '@/domain/inventory/ProductType'
import DomainException from '@/utils/exceptions/domain-exception'

export interface IInventory {
   products: Product[]
   productTypes: ProductType[]
   clone(): Inventory
   toObject(): InventoryObject
   addProduct(product: Product): Product
   removeProduct(productId: number): boolean
   findProduct(productId: number): Product | undefined
   getProductsByType(typeId: number): Product[]
   getLowStockProducts(threshold?: number): Product[]
   increaseStock(productId: number, quantity?: number): Product
   decreaseStock(productId: number, quantity?: number): Product
}

export interface InventoryObject {
   products: ProductObject[]
   productTypes: ProductTypeObject[]
}

interface InventoryConstructor {
   products?: Product[]
   productTypes?: ProductType[]
}

export default class Inventory implements IInventory {
   private _products: Product[] = []
   private _productTypes: ProductType[] = []

   constructor(props?: InventoryConstructor) {
      if (!props) return

      if (props.products) this.products = props.products
      if (props.productTypes) this.productTypes = props.productTypes
   }

   public get products(): Product[] { return this._products; }
   public set products(value: Product[]) {
      if (!Array.isArray(value) || value.some((product) => !(product instanceof Product))) {
         throw new DomainException('products', 'Los productos del inventario no son válidos')
      }

      this._products = value.map((product) => product.clone())
   }

   public get productTypes(): ProductType[] { return this._productTypes; }
   public set productTypes(value: ProductType[]) {
      if (!Array.isArray(value) || value.some((type) => !(type instanceof ProductType))) {
         throw new DomainException('productTypes', 'Los tipos de producto no son válidos')
      }

      this._productTypes = value.map((type) => type.clone())
   }

   public get totalProducts(): number { return this._products.length; }
   public get totalUnits(): number { return this._products.reduce((total, product) => total + product.stock, 0); }

   public clone(): Inventory {
      return new Inventory({
         products: this._products,
         productTypes: this._productTypes
      })
   }

   public toObject(): InventoryObject {
      return {
         products: this._products.map((product) => product.toObject()),
         productTypes: this._productTypes.map((type) => type.toObject())
      }
   }

   public addProduct(product: Product): Product {
      if (!(product instanceof Product)) throw new DomainException('product', 'El producto no es válido')

      const productCopy = product.clone()
      const existingIndex = this._products.findIndex((item) => item.id === productCopy.id)

      if (existingIndex !== -1 && productCopy.id !== 0) {
         this._products = this._products.map((item, index) => index === existingIndex ? productCopy : item)
      } else {
         this._products = [...this._products, productCopy]
      }

      return productCopy
   }

   public removeProduct(productId: number): boolean {
      const products = this._products.filter((product) => product.id !== productId)

      if (products.length === this._products.length) return false

      this._products = products
      return true
   }

   public findProduct(productId: number): Product | undefined {
      return this._products.find((product) => product.id === productId)
   }

   public getProductsByType(typeId: number): Product[] {
      return this._products.filter((product) => product.type.id === typeId)
   }

   public getLowStockProducts(threshold?: number): Product[] {
      return this._products.filter((product) => product.isLowStock(threshold))
   }

   public increaseStock(productId: number, quantity: number = 1): Product {
      const product = this.findProduct(productId)
      if (!product) throw new DomainException('productId', `No se encontró el producto con id ${productId}`)

      product.increaseStock(quantity)
      return product
   }

   public decreaseStock(productId: number, quantity: number = 1): Product {
      const product = this.findProduct(productId)
      if (!product) throw new DomainException('productId', `No se encontró el producto con id ${productId}`)

      product.decreaseStock(quantity)
      return product
   }
}
