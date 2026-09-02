export interface CustomerType {
   id: string
   name: string
   username?: string
   phone_number: string
   email?: string
}

export interface ICustomer extends CustomerType {
   clone(): Customer
   toObject(): CustomerType
}

export default class Customer {
   private _id: string
   private _name: string
   private _username?: string
   private _phone_number: string
   private _email?: string;

   constructor();
   constructor(id: string, name: string, phone_number: string, username?: string, email?: string);
   constructor(id?: string, name?: string, phone_number?: string, username?: string, email?: string) {
      this._id = id ?? '';
      this._name = name ?? '';
      this._phone_number = phone_number ?? '';
      this._username = username ?? undefined;
      this._email = email ?? undefined;
   }

   public get id(): string { return this._id; }
   public set id(value: string) { this._id = value; }

   public get name(): string { return this._name; }
   public set name(value: string) { this._name = value; }

   public get username(): string | undefined { return this._username; }
   public set username(value: string | undefined) { this._username = value; }

   public get phone_number(): string { return this._phone_number; }
   public set phone_number(value: string) { this._phone_number = value; }

   public get email(): string | undefined { return this._email; }
   public set email(value: string | undefined) { this._email = value; }

   public clone(): Customer {
      const copy = new Customer();
      copy.id = this._id;
      copy.name = this._name;
      copy.username = this._username;
      copy.phone_number = this._phone_number;
      copy.email = this._email;
      return copy;
   }

   public toObject(): CustomerType {
      return {
         id: this._id,
         name: this._name,
         username: this._username,
         phone_number: this._phone_number,
         email: this._email
      }
   }
}
