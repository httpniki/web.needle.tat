import NumberInput from '@/components/ui/inputs/NumberInput'

interface Props {
   showInput?: boolean
   booking_fee: number
   onChange?: (booking_fee: number) => void
   error?: string
}

export default function SessionBookingFee(props: Props) {
   return (
      <div className='flex max-w-48 items-center gap-1.5 text-sm'>
         <p>Seña:</p>

         <span>$</span>

         {(props.showInput)
            ? <NumberInput
               defaultValue={props.booking_fee}
               onChange={(value) => props.onChange?.(value)}
               error={!!props.error}
            />
            : <p>{props.booking_fee}</p>
         }
      </div>
   )
}
