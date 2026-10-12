import { useState } from 'react';

import EditSVG from '@/components/svg/EditSVG';
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
   const [renderInput, setRenderInput] = useState(props.defaultView === 'Input')

   function showInput() {
      if (!props.enableEdit) return
      setRenderInput(true)
   }

   return (
      <section className=''>
         <div className='flex items-center gap-2'>
            <p className="mb-1.5 text-white/50">Usuario</p>
            {props.loading && <Loader size='16px' />}
         </div>

         <div className='flex w-full min-w-0 items-center gap-2'>
            {(!renderInput && props.defaultView === 'Summary') &&
               <>
                  <p className='truncate'>{props.username ?? 'Sin usuario'}</p>

                  {props.enableEdit &&
                     <button
                        className='cursor-pointer text-white/70 transition-all duration-200 hover:opacity-80'
                        onClick={(event) => { event.preventDefault(); showInput() }}
                     >
                        <EditSVG size='1.2em' />
                     </button>
                  }
               </>
            }

            {(renderInput) &&
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
                           if (props.enableEdit) setRenderInput(false);
                           if (props.enableCustomerSearch) closeOverlay(event)
                        }}
                        onFocus={() => {
                           if (props.enableCustomerSearch) openOverlay()
                        }}
                        onChange={(event) => {
                           props.onChange?.(event.target.value)
                           if(props.enableCustomerSearch) setSearchParam(event.target.value)
                        }}
                        autoFocus={props.defaultView === 'Summary'}
                        error={!!props.error}
                     />
                  )}
               </CustomerSearchWrapper>
            }
         </div>
      </section>
   )
}
