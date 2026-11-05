interface Props {
   stock: string
   onChange: (value: string) => void
}

export default function HectographPaper({ stock, onChange }: Props) {
   return (
      <label className='flex flex-col gap-1.5'>
         <span className='text-xs text-gray-400'>
            Stock
         </span>

         <input
            id='hectograph-paper-stock'
            type='number'
            min={0}
            step={1}
            value={stock}
            className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40'
            onChange={(event) => onChange(event.target.value)}
         />
      </label>
   )
}
