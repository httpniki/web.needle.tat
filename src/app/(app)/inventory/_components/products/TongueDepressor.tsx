import DateInput from '@/components/ui/inputs/DateInput'

export type TongueDepressorField = 'expirationDate' | 'stock'

interface Props {
   expirationDate: string
   stock: string
   onChange: (field: TongueDepressorField, value: string) => void
}

export default function TongueDepressor({ expirationDate, stock, onChange }: Props) {
   return (
      <>
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
               id='tongue-depressor-stock'
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
