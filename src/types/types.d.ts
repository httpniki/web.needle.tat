export interface TattooSession {
   date: Date
   time: number
   observations: string
   status: 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED'
   price: number
   currency: 'EUR' | 'USD' | 'ARS'
}

export interface TattooProject {
   id: string
   client_id: string
   images: string[]
   references: string[]
   sessions: TattooSession[]
}

interface Customer {
   id: string
   name: string
   username?: string
   phone_number: string
}
