export type SolidVaselineField = 'quantityInGrams' | 'stock'

interface Props {
   quantityInGrams: string
   stock: string
   onChange: (field: SolidVaselineField, value: string) => void
}

export default function SolidVaseline({ quantityInGrams, stock, onChange }: Props) {
   return (
      <>
         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Cantidad (g)
            </span>

            <input
               id='solid-vaseline-quantity'
               type='number'
               min={0}
               step={1}
               value={quantityInGrams}
               className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40'
               onChange={(event) => onChange('quantityInGrams', event.target.value)}
            />
         </label>

         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Stock
            </span>

            <input
               id='solid-vaseline-stock'
               type='number'
               min={0}
               step={1}
               value={stock}
               className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40'
               onChange={(event) => onChange('stock', event.target.value)}
            />
         </label>
      </>
   )
}
