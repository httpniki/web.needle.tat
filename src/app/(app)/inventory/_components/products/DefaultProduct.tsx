import TextInput from '@/components/ui/inputs/TextInput'

export type DefaultProductField = 'name' | 'stock'

interface Props {
   name: string
   stock: string
   onChange: (field: DefaultProductField, value: string) => void
}

export default function DefaultProduct({ name, stock, onChange }: Props) {
   return (
      <>
         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Nombre
            </span>

            <TextInput
               id='product-name'
               placeholder='Ej: Agujas 0.30 mm RL'
               value={name}
               autoFocus
               onChange={(event) => onChange('name', event.target.value)}
            />
         </label>

         <label className='flex flex-col gap-1.5'>
            <span className='text-xs text-gray-400'>
               Stock
            </span>

            <input
               id='product-stock'
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
