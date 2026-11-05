import DateInput from '@/components/ui/inputs/DateInput'
import InputSelect from '@/components/ui/InputSelect'
import { NITRILE_GLOVE_SIZES } from '@/domain/inventory/products/NitrileGloves'

export type NitrileGlovesField = 'size' | 'expirationDate' | 'stock'

interface Props {
   size: string
   expirationDate: string
   stock: string
   onChange: (field: NitrileGlovesField, value: string) => void
}

const sizeOptions = NITRILE_GLOVE_SIZES.map((size) => ({ value: size, label: size }))

export default function NitrileGloves({ size, expirationDate, stock, onChange }: Props) {
   return (
      <>
         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Medida
            </span>

            <InputSelect
               id='nitrile-gloves-size'
               options={sizeOptions}
               value={size}
               placeholder='Seleccionar medida'
               onChange={(value) => onChange('size', value)}
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
               id='nitrile-gloves-stock'
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
