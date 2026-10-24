import TextInput from '@/components/ui/inputs/TextInput';
import Loader from '@/components/ui/Loader';
import { CustomerObject } from '@/domain/Customer';

import CustomerSearchWrapper from './CustomerSearchWrapper';

interface Props {
   email?: string
   onChange?: (value: string) => void
   loading?: boolean
   defaultView?: 'Input' | 'Summary'
   enableEdit?: boolean
   enableCustomerSearch?: boolean
   onSelectCustomer?: (customer: CustomerObject) => void
   error?: string
}

export default function CustomerEmail(props: Props) {
   const renderInput = props.defaultView === 'Input'

   return (
      <section className='w-full overflow-hidden'>
         <div className='flex items-center gap-2'>
            <p className="mb-1.5 text-white/50">Email</p>
            {props.loading && <Loader size='16px' />}
         </div>

         <div className='flex w-full items-center gap-2'>
            {(!renderInput && props.defaultView === 'Summary') &&
               <p className='truncate'>
                  {props.email ?? 'Sin email'}
               </p>
            }

            {renderInput &&
               <CustomerSearchWrapper
                  onSelectCustomer={(customer) => props.onSelectCustomer?.(customer)}
                  onSelectCustomValue={(value) => props.onChange?.(value)}
               >
                  {({ openOverlay, closeOverlay, setSearchParam }) => (
                     <TextInput
                        id='customer-email'
                        placeholder='email@domain.com'
                        defaultValue={props.email ?? ''}
                        value={props.email ?? ''}
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
