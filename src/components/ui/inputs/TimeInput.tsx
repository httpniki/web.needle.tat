import { type ChangeEvent, useState } from "react"

interface Props {
   onChange?: (time: string) => void
   value?: string
   error?: boolean
}

export default function TimeInput(props: Props) {
   const [prevValue, setPrevValue] = useState<string | undefined>(props.value)
   const [time, setTime] = useState<string>(props.value ?? '')

   if (props.value !== prevValue) {
      setPrevValue(props.value)
      setTime(props.value ?? '')
   }

   function handleChange(e: ChangeEvent<HTMLInputElement>): void {
      const input = e.target.value

      // Permitir borrar (Backspace) libremente
      if (input.length < time.length) {
         setTime(input)
         return
      }

      // Permitir al usuario tipear ":" para saltar a los minutos
      // Ejemplo: escribe "9" y luego ":", se transforma en "09:"
      if (input.endsWith(':')) {
         const parts: string[] = input.slice(0, -1).split(':')

         if (parts.length === 1 && parts[0].length === 1) {
            setTime(`0${parts[0]}:`)
            return
         }
      }

      // Limpiar cualquier caracter que no sea un número
      const raw = input.replace(/\D/g, '')
      let formatted = ''

      // Lógica Hora (Formato 24hs)
      if (raw.length > 0) {
         let hour = raw.substring(0, 2)
         // Si el primer dígito es mayor a 2 (ej. 3 a 9), asume que es "03" a "09"
         if (hour.length === 1 && parseInt(hour, 10) > 2) hour = `0${hour}`

         // Limita la hora máxima a 23
         if (hour.length === 2 && parseInt(hour, 10) > 23) hour = '23'

         formatted += hour

         if (hour.length === 2) formatted += ':'
      }

      // Lógica mientras escribe los Minutos
      if (raw.length > 2) {
         let minute = raw.substring(2, 4)
         // Si el primer dígito de los minutos es mayor a 5 (ej. 6), lo autocompleta con 0
         if (minute.length === 1 && parseInt(minute, 10) > 5) minute = `0${minute}`
         // Limita los minutos máximos a 59
         if (minute.length === 2 && parseInt(minute, 10) > 59) minute = '59'

         formatted += minute
      }

      setTime(formatted)
   }

   function handleBlur(): void {
      if (!time) return

      const today: Date = new Date()
      const currentHour: string = String(today.getHours()).padStart(2, '0')
      const currentMinute: string = String(today.getMinutes()).padStart(2, '0')

      const parts: string[] = time.split(':')
      let hour: string = parts[0] || ''
      let minute: string = parts[1] || ''

      // Formatear y completar la Hora
      if (hour.length === 1) hour = `0${hour}`
      if (hour === '') hour = currentHour

      // Formatear y completar los Minutos
      if (minute.length === 1) minute = `0${minute}`
      if (minute === '') minute = currentMinute

      const finalTime = `${hour}:${minute}`

      setTime(finalTime)
      if (props.onChange) props.onChange(finalTime)
   }

   return (
      <input
         className={"w-full px-2 py-1 border border-gray-primary rounded-md outline-none text-sm text-center" +
            (props.error ? " border-red-700" : "")
         }
         type="text"
         value={time}
         onChange={handleChange}
         onBlur={handleBlur}
         placeholder="HH:MM"
         maxLength={5}
      />
   )
}
