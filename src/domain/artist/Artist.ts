import DomainException from '@/utils/exceptions/domain-exception'

export type ArtistRole = 'artist' | 'owner'
export type ArtistInvitationStatus = 'pending' | 'accepted'

export interface IArtist {
   id: string
   email: string
   role: ArtistRole
   invitationStatus: ArtistInvitationStatus
   clone(): Artist
   toObject(): ArtistObject
   isOwner(): boolean
   isInvitationAccepted(): boolean
}

export interface ArtistObject {
   id: string
   email: string
   role: ArtistRole
   invitationStatus: ArtistInvitationStatus
}

export interface ArtistOption {
   id: string
   email: string
   role: ArtistRole
}

interface ArtistConstructor {
   id?: string
   email: string
   role: ArtistRole
   invitationStatus?: ArtistInvitationStatus
}

export default class Artist implements IArtist {
   private _id = ''
   private _email = ''
   private _role: ArtistRole = 'artist'
   private _invitationStatus: ArtistInvitationStatus = 'accepted'

   constructor(props?: ArtistConstructor) {
      if (!props) return

      if (props.id !== undefined) this.id = props.id
      this.email = props.email
      this.role = props.role
      if (props.invitationStatus !== undefined) this.invitationStatus = props.invitationStatus
   }

   public get id(): string { return this._id; }
   public set id(value: string) {
      const trimmedValue = value.trim()
      if (!trimmedValue) throw new DomainException('id', 'El id del artista no es válido')

      this._id = trimmedValue
   }

   public get email(): string { return this._email; }
   public set email(value: string) {
      const trimmedValue = value.trim().toLowerCase()

      if (!trimmedValue || trimmedValue.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
         throw new DomainException('email', 'El email del artista no es válido')
      }

      this._email = trimmedValue
   }

   public get role(): ArtistRole { return this._role; }
   public set role(value: ArtistRole) {
      if (value !== 'artist' && value !== 'owner') {
         throw new DomainException('role', 'El rol del artista no es válido')
      }

      this._role = value
   }

   public get invitationStatus(): ArtistInvitationStatus { return this._invitationStatus; }
   public set invitationStatus(value: ArtistInvitationStatus) {
      if (value !== 'pending' && value !== 'accepted') {
         throw new DomainException('invitationStatus', 'El estado de la invitación no es válido')
      }

      this._invitationStatus = value
   }

   public isOwner(): boolean {
      return this._role === 'owner'
   }

   public isInvitationAccepted(): boolean {
      return this._invitationStatus === 'accepted'
   }

   public clone(): Artist {
      return new Artist({
         id: this._id,
         email: this._email,
         role: this._role,
         invitationStatus: this._invitationStatus
      })
   }

   public toObject(): ArtistObject {
      return {
         id: this._id,
         email: this._email,
         role: this._role,
         invitationStatus: this._invitationStatus
      }
   }
}
