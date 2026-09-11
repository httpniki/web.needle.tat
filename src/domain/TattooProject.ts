import Customer, { CustomerObject } from "./Customer"
import TattooReference, { TattooReferenceObject } from "./TattooReference"
import TattooSession, { TattooSessionObject } from "./TattooSession"

export interface ITattooProject {
   id: number
   images: string[]
   references: TattooReference[]
   sessions: TattooSession[]
   observations?: string
   customer: Customer
   clone(): TattooProject
   toObject(): TattooProjectObject
   hasSession(session: TattooSession | number): boolean
   getMonthSessions(month: number): TattooSession[]
}

export interface TattooProjectObject {
   id: number
   customer: CustomerObject
   images: string[]
   references: TattooReferenceObject[]
   sessions: TattooSessionObject[]
   observations?: string
}

interface TattooProjectConstructor {
   id: number
   customer: Customer
   images: string[]
   references: TattooReference[]
   sessions: TattooSession[]
   observations?: string
}

export default class TattooProject implements ITattooProject {
   private _id: number = 0
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

   public get id(): number { return this._id; }
   public set id(value: number) { this._id = value; }

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

   public hasSession(session: TattooSession | number): boolean {
      if (typeof session === 'number') return !!this._sessions.find((s) => s.id === session)
      if (session instanceof TattooSession) return !!this._sessions.find((s) => s.id === session.id)

      return false
   }

   public getMonthSessions(month: number): TattooSession[] {
      return this._sessions.filter((s) => s.starts_at.getMonth() === month)
   }
}
