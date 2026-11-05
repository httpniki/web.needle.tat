import InputSelect from '@/components/ui/InputSelect'
import { CUP_SIZES } from '@/domain/inventory/products/Cups'

export type CupsField = 'size' | 'stock'

interface Props {
   size: string
   stock: string
   onChange: (field: CupsField, value: string) => void
}

const sizeOptions = CUP_SIZES.map((size) => ({ value: size, label: size }))

export default function Cups({ size, stock, onChange }: Props) {
   return (
      <>
         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Medida
            </span>

            <InputSelect
               id='cups-size'
               options={sizeOptions}
               value={size}
               placeholder='Seleccionar medida'
               onChange={(value) => onChange('size', value)}
            />
         </label>

         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Stock
            </span>

            <input
               id='cups-stock'
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
