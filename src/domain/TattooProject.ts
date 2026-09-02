import TattooSession, { TattooSessionType } from "./TattooSession"

export interface TattooProjectType {
   id: string
   customer_id: string
   images: string[]
   references: string[]
   sessions: TattooSessionType[]
   observations?: string
}

export interface ITattooProject extends TattooProjectType {
   clone(): TattooProject
   toObject(): TattooProjectType
}

export default class TattooProject implements ITattooProject {
   private _id: string = '';
   private _customer_id: string = ''
   private _images: string[] = []
   private _references: string[] = []
   private _sessions: TattooSession[] = []
   private _observations: string = ''

   constructor();
   constructor(
      id: string,
      customer_id: string,
      images: string[],
      references: string[],
      sessions: TattooSession[],
      observations: string
   );
   constructor(
      id?: string,
      customer_id?: string,
      images?: string[],
      references?: string[],
      sessions?: TattooSession[],
      observations?: string
   ) {
      this._id = id ?? '';
      this._customer_id = customer_id ?? '';
      this._images = images ? [...images] : [];
      this._references = references ? [...references] : [];
      this._sessions = sessions ? sessions.map((s) => s.clone()) : [];
      this._observations = observations ?? '';
   }

   public get id(): string { return this._id; }
   public set id(value: string) { this._id = value; }

   public get customer_id(): string { return this._customer_id; }
   public set customer_id(value: string) { this._customer_id = value; }

   public get images(): string[] { return this._images; }
   public set images(value: string[]) { this._images = value }

   public get references(): string[] { return this._references; }
   public set references(value: string[]) { this._references = value };

   public get sessions(): TattooSession[] { return this._sessions; }
   public set sessions(value: TattooSession[]) { this._sessions = value.map((s) => s.clone()) }

   public get observations(): string { return this.observations; }
   public set observations(value: string) { this.observations = value; }

   public clone(): TattooProject {
      const copy = new TattooProject();

      copy._id = this._id;
      copy._customer_id = this._customer_id;
      copy._images = this._images;
      copy._references = this._references;
      copy._sessions = this._sessions.map((s) => s.clone());
      copy._observations = this._observations;

      return copy;
   }

   public toObject(): TattooProjectType {
      return {
         id: this._id,
         customer_id: this._customer_id,
         images: this._images,
         references: this._references,
         sessions: this._sessions.map((s) => s.toObject()),
         observations: this._observations
      }
   }
}
