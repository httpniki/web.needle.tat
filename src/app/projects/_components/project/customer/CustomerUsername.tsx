import TextInput from '@/components/ui/inputs/TextInput';
import Loader from '@/components/ui/Loader';
import { CustomerObject } from '@/domain/Customer';

import CustomerSearchWrapper from './CustomerSearchWrapper';

interface Props {
   username?: string
   onChange?: (value: string) => void
   loading?: boolean
   enableEdit?: boolean
   enableCustomerSearch?: boolean
   defaultView?: 'Input' | 'Summary'
   onSelectCustomer?: (customer: CustomerObject) => void
   error?: string
}

export default function CustomerUsername(props: Props) {
   const renderInput = props.defaultView === 'Input'

   return (
      <section className=''>
         <div className='flex items-center gap-2'>
            <p className="mb-1.5 text-white/50">Usuario</p>
            {props.loading && <Loader size='16px' />}
         </div>

         <div className='flex w-full min-w-0 items-center gap-2'>
            {(!renderInput && props.defaultView === 'Summary') &&
               <p className='truncate'>{props.username ?? 'Sin usuario'}</p>
            }

            {renderInput &&
               <CustomerSearchWrapper
                  onSelectCustomer={(customer) => props.onSelectCustomer?.(customer)}
                  onSelectCustomValue={(value) => props.onChange?.(value)}
               >
                  {({ openOverlay, closeOverlay, setSearchParam }) => (
                     <TextInput
                        id='customer-username'
                        placeholder='Usuario'
                        defaultValue={props.username ?? ''}
                        value={props.username ?? ''}
                        onBlur={(event) => {
                           event.preventDefault();
                           if (props.enableCustomerSearch) closeOverlay(event)
                        }}
                        onFocus={() => {
                           if (props.enableCustomerSearch) openOverlay()
                        }}
                        onChange={(event) => {
                           props.onChange?.(event.target.value)
                           if (props.enableCustomerSearch) setSearchParam(event.target.value)
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
