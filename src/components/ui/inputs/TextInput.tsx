interface Props {
   placeholder?: string
   onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
   onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
   onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
   defaultValue?: string
   value?: string
   error?: boolean
}

export default function TextInput(props: Props) {
   return (
      <input
         type="text"
         className={"w-full border border-gray-primary text-white text-sm outline-none px-3 py-2 rounded-md" +
            (props.error ? " border-red-700" : "")
         }
         placeholder={props.placeholder}
         onChange={(event) => props.onChange?.(event)}
         onFocus={(event) => props.onFocus?.(event)}
         onBlur={(event) => props.onBlur?.(event)}
         defaultValue={props.defaultValue}
         value={props.value}
      />
   )
}
