import DateInput from '@/components/ui/inputs/DateInput'
import TextInput from '@/components/ui/inputs/TextInput'

export type InkField = 'sizeInOz' | 'color' | 'expirationDate' | 'stock'

interface Props {
   sizeInOz: string
   color: string
   expirationDate: string
   stock: string
   onChange: (field: InkField, value: string) => void
}

export default function Ink({ sizeInOz, color, expirationDate, stock, onChange }: Props) {
   return (
      <>
         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Tamaño (oz)
            </span>

            <input
               id='ink-size'
               type='number'
               min={0}
               step={0.01}
               value={sizeInOz}
               className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40'
               onChange={(event) => onChange('sizeInOz', event.target.value)}
            />
         </label>

         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Color
            </span>

            <TextInput
               id='ink-color'
               placeholder='Ej: Negro'
               value={color}
               onChange={(event) => onChange('color', event.target.value)}
            />
         </label>

         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Fecha de vencimiento (opcional)
            </span>

            <DateInput
               defaultValue={expirationDate}
               onChange={(value) => onChange('expirationDate', value)}
            />
         </label>

         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Stock
            </span>

            <input
               id='ink-stock'
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
