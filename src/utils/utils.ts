export function isKeyOf<T extends object>(key: string, obj: T): key is Extract<keyof T, string> {
   return key in obj
}

export function formatPrice(price: number): string {
   const hasDecimals = price % 1 !== 0

   return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
   }).format(price)
}
