import TextInput from '@/components/ui/inputs/TextInput';
import Loader from '@/components/ui/Loader';
import { CustomerObject } from '@/domain/Customer';

import CustomerSearchWrapper from './CustomerSearchWrapper';

interface Props {
   phoneNumber: string
   onChange?: (value: string) => void
   loading?: boolean
   enableEdit?: boolean
   enableCustomerSearch?: boolean
   defaultView?: 'Input' | 'Summary'
   onSelectCustomer?: (customer: CustomerObject) => void
   error?: string
}

export default function CustomerPhoneNumber(props: Props) {
   const renderInput = props.defaultView === 'Input'

   return (
      <section className=''>
         <div className='flex items-center gap-2'>
            <p className="mb-1.5 text-white/50">Teléfono</p>
            {props.loading && <Loader size='16px' />}
         </div>

         <div className='flex w-full min-w-0 items-center gap-2'>
            {(!renderInput && props.defaultView === 'Summary') &&
               <p className='truncate'>
                  {props.phoneNumber}
               </p>
            }

            {renderInput &&
               <CustomerSearchWrapper
                  onSelectCustomer={(customer) => props.onSelectCustomer?.(customer)}
                  onSelectCustomValue={(value) => props.onChange?.(value)}
               >
                  {({ openOverlay, closeOverlay, setSearchParam }) => (
                     <TextInput
                        id='customer-phone-number'
                        placeholder='+5491122334455'
                        defaultValue={props.phoneNumber ?? ''}
                        value={props.phoneNumber ?? ''}
                        onChange={(event) => {
                           props.onChange?.(event.target.value)
                           if (props.enableCustomerSearch) setSearchParam(event.target.value)
                        }}
                        onBlur={(event) => {
                           event.preventDefault();
                           if (props.enableCustomerSearch) closeOverlay(event)
                        }}
                        onFocus={() => {
                           if (props.enableCustomerSearch) openOverlay()
                        }}
                        error={!!props.error}
                     />
                  )}
               </CustomerSearchWrapper>
            }
         </div>
      </section>
   )
}
