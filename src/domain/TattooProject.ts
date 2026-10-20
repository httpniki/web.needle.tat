import { addHours } from 'date-fns'

import Customer, { CustomerObject } from './Customer'
import TattooReference, { TattooReferenceObject } from './TattooReference'
import TattooSession, { TattooSessionObject } from './TattooSession'

export interface ITattooProject {
   id: number
   images: string[]
   references: TattooReference[]
   customer: Customer
   sessions: TattooSession[]
   projectName: string
   observations?: string
   bodyPart: string
   clone(): TattooProject
   toObject(): TattooProjectObject
   hasSession(session: TattooSession | number): boolean
   getMonthSessions(month: number): TattooSession[]
}

export interface TattooProjectObject {
   id: number
   projectName: string
   bodyPart: string
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
   bodyPart: string
   references: TattooReference[]
   sessions: TattooSession[]
   observations?: string
   projectName: string
}

export default class TattooProject implements ITattooProject {
   private _id: number = 0
   private _images: string[] = []
   private _references: TattooReference[] = []
   private _sessions: TattooSession[] = []
   private _observations?: string = ''
   private _customer: Customer = new Customer()
   private _projectName: string = ''
   private _bodyPart: string = ''

   constructor(props?: TattooProjectConstructor) {
      if (!props) return
      if (typeof props.observations === 'string') this._observations = props.observations;
      this._id = props.id;
      this._customer = props.customer;
      this._images = props.images;
      this._references = props.references;
      this._sessions = props.sessions;
      this._projectName = props.projectName;
      this._bodyPart = props.bodyPart;
   }

   public get id(): number { return this._id; }
   public set id(value: number) { this._id = value; }

   public get customer(): Customer { return this._customer; }
   public set customer(value: Customer) { this._customer = value; }

   public get projectName(): string { return this._projectName; }
   public set projectName(value: string) { this._projectName = value; }

   public get bodyPart(): string { return this._bodyPart; }
   public set bodyPart(value: string) { this._bodyPart = value; }

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
         projectName: this._projectName,
         images: this._images,
         references: this._references.map((r) => r.clone()),
         sessions: this._sessions.map((s) => s.clone()),
         observations: this._observations,
         bodyPart: this._bodyPart
      });

      return copy;
   }

   public toObject(): ReturnType<ITattooProject['toObject']> {
      return {
         id: this._id,
         customer: this._customer.toObject(),
         projectName: this._projectName,
         images: this._images,
         references: this._references.map((r) => r.toObject()),
         sessions: this._sessions.map((s) => s.toObject()),
         observations: this._observations,
         bodyPart: this._bodyPart
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

   public isHourOccupied(date: Date): boolean {
      const slotStart = date.getTime()
      const slotEnd = addHours(date, 1).getTime()

      return this.sessions.some((session) => {
         const sStart = session.starts_at.getTime()
         const sEnd = session.ends_at.getTime()

         return sStart < slotEnd && sEnd > slotStart
      })
   }
}
