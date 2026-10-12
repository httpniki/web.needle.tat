import NumberInput from '@/components/ui/inputs/NumberInput'
import { TattooSessionObject } from '@/domain/TattooSession'

interface Props {
   currency: TattooSessionObject['currency']
   price: TattooSessionObject['price']
   showInput?: boolean
   onChangeCurrency?: (currency: TattooSessionObject['currency']) => void
   onChangePrice?: (price: TattooSessionObject['price']) => void
   error?: string
}

export default function SessionPrice(props: Props) {
   return (
      <div className='flex max-w-48 items-center gap-1.5 text-sm'>
         <p>Precio:</p>

         {(props.showInput)
            ? <select
               className={
                  'cursor-pointer bg-black-primary outline-none' +
                  (props.error ? ' text-red-700' : ' text-white')
               }
               value={props.currency}
               onChange={(e) => props.onChangeCurrency?.(e.target.value as TattooSessionObject['currency'])}
            >
               <option value="ARS">ARS</option>
               <option value="USD">USD</option>
               <option value="EUR">EUR</option>
            </select>
            : <p>{props.currency}</p>
         }

         <span>$</span>

         {(props.showInput)
            ? <NumberInput
               defaultValue={props.price}
               onChange={(value) => props.onChangePrice?.(value)}
               error={!!props.error}
            />
            : <p>{props.price}</p>
         }
      </div>
   )
}
