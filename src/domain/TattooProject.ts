import Customer, { CustomerObject } from "./Customer"
import TattooReference, { TattooReferenceObject } from "./TattooReference"
import TattooSession, { TattooSessionObject } from "./TattooSession"

export interface ITattooProject {
   id: string
   images: string[]
   references: TattooReference[]
   sessions: TattooSession[]
   observations?: string
   customer: Customer
   clone(): TattooProject
   toObject(): TattooProjectObject
}

export interface TattooProjectObject {
   id: string
   customer: CustomerObject
   images: string[]
   references: TattooReferenceObject[]
   sessions: TattooSessionObject[]
   observations?: string
}

interface TattooProjectConstructor {
   id: string
   customer: Customer
   images: string[]
   references: TattooReference[]
   sessions: TattooSession[]
   observations?: string
}

export default class TattooProject implements ITattooProject {
   private _id: string = '';
   private _images: string[] = []
   private _references: TattooReference[] = []
   private _sessions: TattooSession[] = []
   private _observations?: string = ''
   private _customer: Customer = new Customer()

   constructor(props?: TattooProjectConstructor) {
      if (!props) return
      if (typeof props.observations === 'string') this._observations = props.observations;
      this._id = props.id;
      this._customer = props.customer;
      this._images = props.images;
      this._references = props.references;
      this._sessions = props.sessions;
   }

   public get id(): string { return this._id; }
   public set id(value: string) { this._id = value; }

   public get customer(): Customer { return this._customer; }
   public set customer(value: Customer) { this._customer = value; }

   public get images(): string[] { return this._images; }
   public set images(value: string[]) { this._images = value }

   public get references(): TattooReference[] { return this._references; }
   public set references(value: TattooReference[]) { this._references = value };

   public get sessions(): TattooSession[] { return this._sessions; }
   public set sessions(value: TattooSession[]) { this._sessions = value.map((s) => s.clone()) }

   public get observations(): string | undefined { return this._observations; }
   public set observations(value: string) { this._observations = value; }

   public clone(): TattooProject {
      const copy = new TattooProject({
         id: this._id,
         customer: this._customer.clone(),
         images: this._images,
         references: this._references.map((r) => r.clone()),
         sessions: this._sessions.map((s) => s.clone()),
         observations: this._observations
      });

      return copy;
   }

   public toObject(): ReturnType<ITattooProject['toObject']> {
      return {
         id: this._id,
         customer: this._customer.toObject(),
         images: this._images,
         references: this._references.map((r) => r.toObject()),
         sessions: this._sessions.map((s) => s.toObject()),
         observations: this._observations
      }
   }
}
