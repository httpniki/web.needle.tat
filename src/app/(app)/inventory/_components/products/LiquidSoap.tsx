import DateInput from '@/components/ui/inputs/DateInput'

export type LiquidSoapField = 'liters' | 'expirationDate' | 'stock'

interface Props {
   liters: string
   expirationDate: string
   stock: string
   onChange: (field: LiquidSoapField, value: string) => void
}

export default function LiquidSoap({ liters, expirationDate, stock, onChange }: Props) {
   return (
      <>
         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Medida (L)
            </span>

            <input
               id='liquid-soap-liters'
               type='number'
               min={0}
               step={0.01}
               value={liters}
               className='w-full rounded-md border border-gray-primary bg-black-secondary px-3 py-2 text-sm text-white outline-none focus:border-white/40'
               onChange={(event) => onChange('liters', event.target.value)}
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
               id='liquid-soap-stock'
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
