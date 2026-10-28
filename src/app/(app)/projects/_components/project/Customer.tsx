import { CustomerObject } from '@/domain/Customer';

import CustomerEmail from './customer/CustomerEmail';
import CustomerName from './customer/CustomerName';
import CustomerPhoneNumber from './customer/CustomerPhoneNumber';
import CustomerUsername from './customer/CustomerUsername';

interface Props {
   customer: CustomerObject
   enableEdit?: boolean
   enableCustomerSearch?: boolean
   view?: 'Summary' | 'Input'
   onChange?<K extends keyof Omit<CustomerObject, 'id'>>(key: K, value: NonNullable<CustomerObject[K]>): void
   loading?: {
      [K in keyof Omit<CustomerObject, 'id'>]?: boolean
   }
   onSelectCustomer?: (customer: CustomerObject) => void
   errors?: { field: keyof Omit<CustomerObject, 'id'>; message: string }[]
}

export default function Customer(props: Props) {
   return (
      <section className="flex w-full flex-1 flex-col gap-2 rounded-sm border border-gray-primary p-6">
         <div>
            <h6 className="mb-2 font-bold text-nowrap">Detalles del Cliente</h6>
            {(props.errors && props.errors.length > 0) && <p className='text-sm text-red-700'>{props.errors.map(el => el.message)[0]}</p>}
         </div>

         <fieldset className="flex w-full min-w-0 flex-col gap-6 text-sm md:flex-row">
            <div className='flex min-w-0 flex-1 flex-col gap-2'>
               <CustomerName
                  customerName={props.customer.name}
                  onChange={(value) => { props.onChange?.('name', value) }}
                  loading={props.loading?.name}
                  enableEdit={props.enableEdit}
                  defaultView={props.view ?? 'Summary'}
                  enableCustomerSearch={props.enableCustomerSearch}
                  onSelectCustomer={props.onSelectCustomer}
                  error={props.errors?.find(el => el.field === 'name')?.message}
               />

               <CustomerPhoneNumber
                  phoneNumber={props.customer.phone_number}
                  onChange={(value) => { props.onChange?.('phone_number', value) }}
                  loading={props.loading?.phone_number}
                  enableEdit={props.enableEdit}
                  defaultView={props.view ?? 'Summary'}
                  enableCustomerSearch={props.enableCustomerSearch}
                  onSelectCustomer={props.onSelectCustomer}
                  error={props.errors?.find(el => el.field === 'phone_number')?.message}
               />
            </div>

            <div className='flex min-w-0 flex-1 flex-col gap-2'>
               <CustomerUsername
                  username={props.customer.username}
                  onChange={(value) => { props.onChange?.('username', value) }}
                  loading={props.loading?.username}
                  enableEdit={props.enableEdit}
                  defaultView={props.view ?? 'Summary'}
                  enableCustomerSearch={props.enableCustomerSearch}
                  onSelectCustomer={props.onSelectCustomer}
                  error={props.errors?.find(el => el.field === 'username')?.message}
               />

               <CustomerEmail
                  email={props.customer.email}
                  onChange={(value) => { props.onChange?.('email', value) }}
                  loading={props.loading?.email}
                  enableEdit={props.enableEdit}
                  defaultView={props.view ?? 'Summary'}
                  enableCustomerSearch={props.enableCustomerSearch}
                  onSelectCustomer={props.onSelectCustomer}
                  error={props.errors?.find(el => el.field === 'email')?.message}
               />
            </div>
         </fieldset>
      </section>
   )
}
