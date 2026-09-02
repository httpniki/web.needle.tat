import { ChangeEvent, useState } from "react"

interface Props {
   onChange: (value: number) => void
   defaultValue?: number
   value?: number
   error?: boolean
}

export default function NumberInput(props: Props) {
   const [value, setValue] = useState<string>(String(props?.value) ?? '')

   function handleChange(e: ChangeEvent<HTMLInputElement>): void {
      const input: string = e.target.value

      if (input === '') {
         setValue('')
         return
      }

      // Eliminar cualquier caracter que no sea número o punto
      let cleaned: string = input.replace(/[^0-9.]/g, '')

      // Impedir que el valor empiece con un punto
      if (cleaned.startsWith('.')) {
         cleaned = cleaned.substring(1)
      }

      // Permitir solo un punto (si hay más de uno, conserva solo el primero)
      const parts: string[] = cleaned.split('.')

      if (parts.length > 2) cleaned = `${parts[0]}.${parts.slice(1).join('')}`

      setValue(cleaned)
      props.onChange(Number(cleaned))
   }

   function handleBlur(): void {
      if (!value) return
      // Si el usuario terminó de escribir y dejó el punto al final (ej. "100."), se remueve
      if (value.endsWith('.')) setValue(value.slice(0, -1))
   }

   return (
      <input
         type="text"
         value={value}
         onChange={handleChange}
         onBlur={handleBlur}
         placeholder="0"
         className={"px-2 py-1 border border-gray-primary rounded-lg outline-none text-sm w-full" +
            (props.error ? " border-red-700" : "")
         }
      />
   )
}
