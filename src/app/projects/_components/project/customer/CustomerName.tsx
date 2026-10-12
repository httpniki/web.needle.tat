import { useState } from 'react';

import EditSVG from '@/components/svg/EditSVG';
import TextInput from '@/components/ui/inputs/TextInput';
import Loader from '@/components/ui/Loader';
import { CustomerObject } from '@/domain/Customer';

import CustomerSearchWrapper from './CustomerSearchWrapper';

interface Props {
   customerName: string
   onChange?: (value: string) => void
   defaultView?: 'Input' | 'Summary'
   enableEdit?: boolean
   enableCustomerSearch?: boolean
   loading?: boolean
   onSelectCustomer?: (customer: CustomerObject) => void
   error?: string
}

export default function CustomerName(props: Props) {
   const [renderInput, setRenderInput] = useState(props.defaultView === 'Input')

   function showInput() {
      if (!props.enableEdit) return
      setRenderInput(true)
   }

   return (
      <section className='w-full overflow-hidden'>
         <div className='flex items-center gap-2'>
            <p className="mb-1.5 text-white/50">Nombre</p>
            {props.loading && <Loader size='16px' />}
         </div>


         <div className='flex items-center gap-2'>
            {(!renderInput && props.defaultView === 'Summary') &&
               <>
                  <p className={'truncate' + (renderInput ? ' hidden' : '')}>
                     {props.customerName}
                  </p>

                  {props.enableEdit &&
                     <button
                        className='shrink-0 cursor-pointer text-white/70 transition-all duration-200 hover:opacity-80'
                        onClick={(event) => { event.preventDefault(); showInput() }}
                     >
                        <EditSVG size='1.2em' />
                     </button>
                  }
               </>
            }

            {(renderInput) &&
               <CustomerSearchWrapper
                  onSelectCustomer={(customer) => {
                     props.onSelectCustomer?.(customer)
                     if (props.enableEdit) setRenderInput(false)
                  }}
                  onSelectCustomValue={(value) => {
                     props.onChange?.(value)
                     if (props.enableEdit) setRenderInput(false)
                  }}
               >
                  {({ openOverlay, closeOverlay, setSearchParam }) => (
                     <TextInput
                        id='customer-name'
                        placeholder='Nombre completo'
                        defaultValue={props.customerName ?? ''}
                        value={props.customerName ?? ''}
                        error={!!props.error}
                        onBlur={(event) => {
                           event.preventDefault();
                           if (props.enableEdit && renderInput) setRenderInput(true);
                           if (props.enableCustomerSearch) closeOverlay(event)
                        }}
                        onChange={(event) => {
                           props.onChange?.(event.target.value)
                           if(props.enableCustomerSearch) setSearchParam(event.target.value)
                        }}
                        autoFocus={props.defaultView === 'Summary'}
                        onFocus={() => {
                           if (props.enableCustomerSearch) openOverlay()
                        }}
                     />
                  )}
               </CustomerSearchWrapper>
            }
         </div>
      </section>
   )
}
