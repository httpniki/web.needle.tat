import { type ChangeEvent, useState } from "react"

interface Props {
   onChange?: (date: string) => void
   defaultValue?: string
   value?: string
   error?: boolean
}

export default function DateInput(props: Props) {
   const [prevValue, setPrevValue] = useState<string | undefined>(props.value)
   const [date, setDate] = useState<string>(props.value ?? '')

   if (props.value !== prevValue) {
      setPrevValue(props.value)
      setDate(props.value ?? '')
   }

   function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const input: string = e.target.value

      // Permitir borrar (Backspace) libremente
      if (input.length < date.length) {
         setDate(input)
         return
      }

      // Permitir al usuario tipear "/" para saltar al siguiente campo
      if (input.endsWith('/')) {
         const parts: string[] = input.slice(0, -1).split('/')
         if (parts.length === 1 && parts[0].length === 1) {
            setDate(`0${parts[0]}/`)
            return
         }
         if (parts.length === 2 && parts[1].length === 1) {
            setDate(`${parts[0]}/0${parts[1]}/`)
            return
         }
      }

      // Limpiar cualquier caracter que no sea un número
      const raw: string = input.replace(/\D/g, '')
      let formatted: string = ''

      // Lógica Día
      if (raw.length > 0) {
         let day: string = raw.substring(0, 2)

         if (day.length === 1 && parseInt(day, 10) > 3) day = `0${day}`

         if (day.length === 2 && parseInt(day, 10) > 31) day = '31'

         formatted += day

         if (day.length === 2) formatted += '/'
      }

      // Lógica Mes
      if (raw.length > 2) {
         let month: string = raw.substring(2, 4)

         if (month.length === 1 && parseInt(month, 10) > 1) month = `0${month}`

         if (month.length === 2 && parseInt(month, 10) > 12) month = '12'

         formatted += month

         if (month.length === 2) formatted += '/'
      }

      // Lógica Año
      if (raw.length > 4) formatted += raw.substring(4, 8)

      setDate(formatted)
   }

   function handleBlur() {
      if (!date) return

      const today: Date = new Date()
      const currentDay = String(today.getDate()).padStart(2, '0')
      const currentMonth = String(today.getMonth() + 1).padStart(2, '0')
      const currentYear = String(today.getFullYear())

      const parts: string[] = date.split('/')
      let day = parts[0] || ''
      let month = parts[1] || ''
      let year = parts[2] || ''

      // Formatear y completar el Día
      if (day.length === 1) day = `0${day}`
      if (day === '' || day === '00') day = currentDay

      // Formatear y completar el Mes
      if (month.length === 1) month = `0${month}`
      if (month === '' || month === '00') month = currentMonth

      // Formatear y completar el Año
      if (year.length === 2) year = `20${year}`
      else if (year.length !== 4) year = currentYear

      const finalDate = `${day}/${month}/${year}`

      setDate(finalDate)
      if (props.onChange) props.onChange(finalDate)
   }

   return (
      <input
         className={"w-full px-2 py-1 border border-gray-primary text-sm text-center rounded-md outline-none" + 
            (props.error ? " border-red-700" : "")
         }
         type="text"
         value={date}
         onChange={handleChange}
         onBlur={handleBlur}
         placeholder="DD/MM/YYYY"
         maxLength={10}
      />
   )
}
