import DomainException from "@/utils/exceptions/domain-exception";
import { addHours, addMilliseconds, differenceInMilliseconds } from "date-fns";

export enum SessionStatus {
   PENDING = 'PENDING',
   IN_PROGRESS = 'IN_PROGRESS',
   FINISHED = 'FINISHED',
   CANCELLED = 'CANCELLED'
}

export enum Currency {
   ARS = 'ARS',
   USD = 'USD',
   EUR = 'EUR'
}

export interface TattooSessionType {
   id: string
   starts_at: Date
   ends_at: Date
   observations?: string
   status: SessionStatus
   price: number
   currency: Currency
}

type TattooSessionConsturctor = {
   id: string,
   starts_at: Date,
   ends_at: Date,
   price: number,
   currency?: Currency,
   status?: SessionStatus,
   observations?: string
}

export interface ITattooSession extends TattooSessionType {
   clone(): TattooSession
   toObject(): TattooSessionType
}

export default class TattooSession implements ITattooSession {
   private _id: string = '';
   private _starts_at: Date = new Date();
   private _ends_at: Date = addHours(new Date(), 1);
   private _observations: string = '';
   private _status: SessionStatus = SessionStatus.PENDING;
   private _price: number = 0;
   private _currency: Currency = Currency.ARS;

   constructor(props?: TattooSessionConsturctor) {
      if (!props) return
      this._id = props.id;
      if(props.status) this._status = props.status;
      if(props.currency) this._currency = props.currency;
      if(props.observations) this._observations = props.observations;
      this._starts_at = new Date(props.starts_at.getTime());
      this._ends_at = new Date(props.ends_at.getTime());
      this._price = props.price;
   }

   public get starts_at(): Date { return this._starts_at; }
   public set starts_at(value: Date) {
      const durationInMs = differenceInMilliseconds(this._ends_at, this._starts_at)
      const newEndsAt = addMilliseconds(value, durationInMs)

      this._starts_at = value
      this._ends_at = newEndsAt
   }

   public get ends_at(): Date { return this._ends_at; }
   public set ends_at(value: Date) {
      if (value.getTime() < this._starts_at.getTime()) throw new DomainException('ends_at', 'La hora de finalización no puede ser anterior a la de inicio')
      this._ends_at = value
   }

   public get observations(): string { return this._observations; }
   public set observations(value: string) { this._observations = value; }

   public get status(): SessionStatus { return this._status; }
   public set status(value: SessionStatus) { this._status = value; }

   public get price(): number { return this._price; }
   public set price(value: number) { this._price = value; }

   public get currency(): Currency { return this._currency; }
   public set currency(value: Currency) { this._currency = value; }

   public get id(): string { return this._id; }
   public set id(value: string) { this._id = value; }

   public clone(): TattooSession {
      const copy = new TattooSession();
      copy._id = this._id;
      copy._starts_at = this._starts_at
      copy._ends_at = this._ends_at
      copy._observations = this._observations;
      copy._status = this._status;
      copy._price = this._price;
      copy._currency = this._currency;
      return copy;
   }

   public toObject(): TattooSessionType {
      return {
         id: this._id,
         starts_at: this._starts_at,
         ends_at: this._ends_at,
         observations: this._observations,
         status: this._status,
         price: this._price,
         currency: this._currency
      }
   }
}
