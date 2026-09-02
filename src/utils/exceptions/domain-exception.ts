export default class DomainException<K extends string = string> extends Error {
   constructor(
      public readonly field: K, 
      message: string
   ) {
      super(message)
      this.field = field
      this.name = 'DomainException'
   }
}
