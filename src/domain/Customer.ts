import TattooProject, { TattooProjectObject } from './TattooProject'

export interface ICustomer {
   id: number
   name: string
   username?: string
   phone_number: string
   email?: string
   tattooProjects: TattooProject[]
   clone(): Customer
   toObject(): CustomerObject
}

export interface CustomerObject {
   id: number
   name: string
   username?: string
   phone_number: string
   email?: string
   tattooProjects: TattooProjectObject[]
}

type CustomerConstructor = {
   id: number
   name: string
   username?: string
   phone_number: string
   email?: string
   tattooProjects: TattooProject[]
}

export default class Customer {
   private _id!: number
   private _name!: string
   private _username?: string
   private _phone_number!: string
   private _email?: string;
   private _tattooProjects: TattooProject[] = []

   constructor(props?: CustomerConstructor) {
      if (props?.id) this._id = props.id;
      if (props?.name) this._name = props.name;
      if (props?.username) this._username = props.username;
      if (props?.phone_number) this._phone_number = props.phone_number;
      if (props?.email) this._email = props.email;
      if (props?.tattooProjects) this._tattooProjects = props.tattooProjects
   }

   public get id(): number { return this._id; }
   public set id(value: number) { this._id = value; }

   public get name(): string { return this._name; }
   public set name(value: string) { this._name = value; }

   public get username(): string | undefined { return this._username; }
   public set username(value: string | undefined) { this._username = value; }

   public get phone_number(): string { return this._phone_number; }
   public set phone_number(value: string) { this._phone_number = value; }

   public get email(): string | undefined { return this._email; }
   public set email(value: string | undefined) { this._email = value; }

   public get tattooProjects(): TattooProject[] { return this._tattooProjects; }
   public set tattooProjects(value: TattooProject[]) { this._tattooProjects = value; }

   public clone(): Customer {
      const copy = new Customer();
      copy.id = this._id;
      copy.name = this._name;
      copy.username = this._username;
      copy.phone_number = this._phone_number;
      copy.email = this._email;
      copy.tattooProjects = this._tattooProjects.map((p) => p.clone());
      return copy;
   }

   public toObject(): CustomerObject {
      return {
         id: this._id,
         name: this._name,
         username: this._username,
         phone_number: this._phone_number,
         email: this._email,
         tattooProjects: this._tattooProjects.map((p) => p.toObject())
      }
   }
}
