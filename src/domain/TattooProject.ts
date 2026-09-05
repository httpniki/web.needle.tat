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

interface TattooProjectConstructor {
   id: string
   customer_id: string
   images: string[]
   references: string[]
   sessions: TattooSession[]
   observations?: string
}

export default class TattooProject implements ITattooProject {
   private _id: string = '';
   private _customer_id: string = ''
   private _images: string[] = []
   private _references: string[] = []
   private _sessions: TattooSession[] = []
   private _observations: string = ''

   constructor(props?: TattooProjectConstructor) {
      if (props?.id) this._id = props.id;
      if (props?.customer_id) this._customer_id = props.customer_id;
      if (props?.images) this._images = props.images;
      if (props?.references) this._references = props.references;
      if (props?.sessions) this._sessions = props.sessions;
      if (props?.observations) this._observations = props.observations;
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

   public get observations(): string { return this._observations; }
   public set observations(value: string) { this._observations = value; }

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

   public static getProjects(): TattooProject[] {
      
   }
}
