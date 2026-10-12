import { ReactNode, useEffect, useRef, useState, useTransition } from 'react'

import { findCustomers } from '@/actions/customer-actions'
import RenderModal from '@/components/RenderModal'
import Loader from '@/components/ui/Loader'
import SearchBar from '@/components/ui/SearchBar'
import { CustomerObject } from '@/domain/Customer'

interface Props {
   searchPlaceholder?: string
   onSelectCustomer: (customer: CustomerObject) => void
   onSelectCustomValue: (value: string) => void
   children: (helpers: {
      openOverlay: () => void
      closeOverlay: (event?: React.FocusEvent) => void
      setSearchParam: (value: string) => void
   }) => ReactNode
}

export default function CustomerSearchWrapper(props: Props) {
   const [showOverlay, setShowOverlay] = useState<boolean>(false)
   const [searchParam, setSearchParam] = useState<string>('')
   const [pending, startTransition] = useTransition()
   const [customers, setCustomers] = useState<CustomerObject[]>([])

   const mobileModalRef = useRef<HTMLDivElement>(null)
   const desktopOverlayRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      startTransition(async () => {
         const results = await findCustomers(searchParam)
         setCustomers(results)
      })
   }, [searchParam])

   useEffect(() => {
      if (!showOverlay) return
      const $input = mobileModalRef.current?.querySelector('#searchbar') as HTMLInputElement
      if ($input) $input?.focus()
   }, [showOverlay])

   function openOverlay() {
      setShowOverlay(true)
   }

   function closeOverlay(event?: React.FocusEvent) {
      const nextFocusedElement = event?.relatedTarget as Node | null
      if (nextFocusedElement && (mobileModalRef.current?.contains(nextFocusedElement) || desktopOverlayRef.current?.contains(nextFocusedElement))) return

      setShowOverlay(false)
   }

   function handleSelectCustomValue() {
      props.onSelectCustomValue(searchParam)
      setShowOverlay(false)
   }

   function handleSelectCustomer(customer: CustomerObject) {
      props.onSelectCustomer(customer)
      setShowOverlay(false)
   }

   return (
      <div className='w-full'>
         {/*eslint-disable-next-line*/}
         {props.children({ openOverlay, closeOverlay, setSearchParam })}

         {showOverlay && (
            <RenderModal className="bg-black-primary lg:hidden" onClickOutside={() => setShowOverlay(false)}>
               <div ref={mobileModalRef} className="animation-overlay m-auto flex size-full max-w-lg flex-col justify-center gap-5 bg-black-primary px-6 py-4">
                  <h1 className="text-center text-xl font-bold">
                     Selecciona un cliente
                  </h1>

                  <SearchBar
                     placeholder={props.searchPlaceholder || 'Buscar cliente...'}
                     onChange={(event) => setSearchParam(event.target.value)}
                     defaultValue={searchParam}
                  />

                  <CustomerList
                     pending={pending}
                     customers={customers}
                     searchParam={searchParam}
                     onSelectCustomer={handleSelectCustomer}
                     onSelectCustomValue={handleSelectCustomValue}
                  />
               </div>
            </RenderModal>
         )}

         {showOverlay && (
            <div ref={desktopOverlayRef} className="animation-overlay absolute z-1000 flex max-h-72 w-100 flex-col justify-center gap-5 border border-gray-primary bg-black-primary px-6 py-4 shadow-[0_0_10px_#ffffff10]">
               <CustomerList
                  pending={pending}
                  customers={customers}
                  searchParam={searchParam}
                  onSelectCustomer={handleSelectCustomer}
                  onSelectCustomValue={handleSelectCustomValue}
               />
            </div>
         )}
      </div>
   )
}

interface CustomerListProps {
   pending: boolean
   customers: CustomerObject[]
   searchParam: string
   onSelectCustomer: (customer: CustomerObject) => void
   onSelectCustomValue: (value: string) => void
}

function CustomerList(props: CustomerListProps) {
   return (
      <ul className="flex h-full max-h-92 flex-col items-center gap-2 overflow-y-auto text-sm">
         {!props.pending && props.searchParam && (
            <li
               className="flex w-full cursor-pointer items-center justify-center px-2 py-1 text-center text-nowrap transition-colors hover:bg-neutral-900"
               onClick={() => props.onSelectCustomValue(props.searchParam)}
            >
               {`Añadir "${props.searchParam}"`}
            </li>
         )}

         {props.pending && <li><Loader /></li>}

         {!props.pending && props.customers.map((customer) => (
            <li
               key={customer.id}
               className="flex w-full cursor-pointer items-center justify-center px-2 py-1 text-center text-nowrap transition-colors hover:bg-neutral-900"
               onMouseDown={(event) => { event.preventDefault(); props.onSelectCustomer(customer) }}
            >
               <p className="mr-1 max-w-[32%] overflow-hidden text-end text-ellipsis">{customer.name}</p>
               {customer.username && <span className="mr-1">(@{customer.username})</span>}
               <span className='opacity-70'>{customer.phone_number ?? 'Unknown'}</span>
            </li>
         ))}
      </ul>
   )
}
