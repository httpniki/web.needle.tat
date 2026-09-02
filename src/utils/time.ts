export function getTodayString(): string {
   const today = new Date()
   const day = String(today.getDate()).padStart(2, '0')
   const month = String(today.getMonth() + 1).padStart(2, '0')
   const year = today.getFullYear()

   return `${day}/${month}/${year}`
}

export function getTodayTime(baseTime?: string, addedMinutes: number = 30): string {
   let hours = 0
   let minutes = 0

   if (baseTime) {
      const parts: string[] = baseTime.split(':')

      hours = parseInt(parts[0], 10) || 0
      minutes = parseInt(parts[1], 10) || 0
   }

   if (!baseTime) {
      const today = new Date()

      hours = today.getHours()
      minutes = today.getMinutes()
   }

   // Sumar los minutos y controlar que no exceda las 24hs (1440 minutos)
   const totalMinutes = (hours * 60 + minutes + addedMinutes) % 1440
   const newHours = Math.floor(totalMinutes / 60)
   const newMinutes = totalMinutes % 60

   const formattedHours = String(newHours).padStart(2, '0')
   const formattedMinutes = String(newMinutes).padStart(2, '0')

   return `${formattedHours}:${formattedMinutes}`
}

export function timeToMinutes(time: string): number {
   const parts = time.split(':')
   if (parts.length !== 2) return 0

   const hours = parseInt(parts[0], 10) || 0
   const minutes = parseInt(parts[1], 10) || 0

   return hours * 60 + minutes
}

export function minutesToTime(totalMinutes: number): string {
   const normalized = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59))
   const hours = Math.floor(normalized / 60)
   const minutes = normalized % 60

   return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function parseDateString(dateStr: string, timeStr?: string): Date {
   const dateParts = dateStr.split('/')

   if (dateParts.length !== 3) {
      throw new Error('Formato de fecha inválido. Usar dd/mm/aaaa')
   }

   const day = parseInt(dateParts[0], 10)
   const month = parseInt(dateParts[1], 10) - 1 // Los meses en JavaScript van de 0 a 11
   let year = parseInt(dateParts[2], 10)

   // Soporte para años en formato 'aa' (ej: 26 -> 2026)
   if (year < 100) {
      year += 2000
   }

   let hours = 0
   let minutes = 0

   if (timeStr) {
      const timeParts = timeStr.split(':')
      hours = parseInt(timeParts[0], 10) || 0
      minutes = parseInt(timeParts[1], 10) || 0
   }

   return new Date(year, month, day, hours, minutes)
}

export function parseToGmt3Date(dateStr: string): Date {
   const [datePart, timePart = '00:00'] = dateStr.trim().split(' ')
   const [day, month, year] = datePart.split('/')
   const [hours, minutes] = timePart.split(':')

   const formattedDay = day.padStart(2, '0')
   const formattedMonth = month.padStart(2, '0')
   const formattedHours = hours.padStart(2, '0')
   const formattedMinutes = minutes.padStart(2, '0')

   const isoString = `${year}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}:00-03:00`

   return new Date(isoString)
}
