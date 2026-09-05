export interface ITattooReference {
   url: string
   file?: File
   clone(): TattooReference
   toObject(): TattooReferenceObject
}

export interface TattooReferenceObject {
   url: string
   file?: File
}

interface TattooReferenceConstructor {
   url: string
   file?: File
}

export default class TattooReference {
   private _file?: File;
   private _url: string = '';

   constructor(props?: TattooReferenceConstructor) {
      if (props?.url) this._url = props.url;
      this._file = props?.file;
   }

   public get url(): string { return this._url; }
   public set url(value: string) { this._url = value; }

   public get file(): File | undefined { return this._file; }
   public set file(value: File) { this._file = value; }

   public clone(): TattooReference {
      const copy = new TattooReference({
         url: this._url,
         file: this._file
      });

      return copy;
   }

   public toObject(): TattooReferenceObject {
      return {
         url: this._url,
         file: this._file
      }
   }
}
