import { ReactNode, useEffect, useRef, useState, useTransition } from "react"
import { findCustomers } from "@/actions/customer-actions"
import RenderModal from "@/components/RenderModal"
import SearchBar from "@/components/ui/SearchBar"
import useNewProject from "../../_context/NewProjectContext"
import Loader from "@/components/ui/Loader"
import TextInput from "@/components/ui/inputs/TextInput"
import CustomerDomain from "@/domain/Customer"

export default function Customer() {
   const store = useNewProject()
   const customerError = Object.values(store.errors.customer).find((value) => value)

   return (
      <section className="flex flex-col gap-2 border border-gray-primary rounded-sm p-6">
         <div className='flex gap-2 items-center'>
            <h6 className="font-bold text-nowrap">Detalles del Cliente</h6>

            {(customerError) &&
               <p className='text-sm text-red-500 text-nowrap text-ellipsis overflow-hidden'>
                  * {customerError}
               </p>
            }
         </div>

         <fieldset className="text-sm flex-col flex gap-2">
            <div className='flex gap-2'>
               <CustomerSearchWrapper
                  onSelectCustomer={(customer) => store.addCustomer(customer)}
                  onSelectCustomValue={(value) => store.updateCustomer('name', value)}
               >
                  {({ openOverlay, setSearchParam, closeOverlay }) =>
                     <label>
                        <p className="text-white/50 mb-1.5">Nombre</p>

                        <TextInput
                           placeholder='Nombre completo'
                           value={store.project.customer.name}
                           onFocus={() => openOverlay()}
                           onChange={(event) => {
                              setSearchParam(event.target.value);
                              store.updateCustomer('name', event.target.value)
                           }}
                           onBlur={(event) => closeOverlay(event)}
                           error={!!store.errors.customer.name}
                        />
                     </label>
                  }
               </CustomerSearchWrapper>

               <CustomerSearchWrapper
                  onSelectCustomer={(customer) => store.addCustomer(customer)}
                  onSelectCustomValue={(value) => store.updateCustomer('phone_number', value)}
               >
                  {({ openOverlay, setSearchParam, closeOverlay }) =>
                     <label>
                        <p className="text-white/50 mb-1.5">Usuario</p>

                        <TextInput
                           placeholder='@Usuario'
                           value={store.project.customer.username}
                           onFocus={() => openOverlay()}
                           onChange={(event) => {
                              setSearchParam(event.target.value)
                              store.updateCustomer('username', event.target.value)
                           }}
                           onBlur={(event) => closeOverlay(event)}
                           error={!!store.errors.customer.username}
                        />
                     </label>
                  }
               </CustomerSearchWrapper>
            </div>

            <div className='flex gap-2'>
               <CustomerSearchWrapper
                  onSelectCustomer={(customer) => store.addCustomer(customer)}
                  onSelectCustomValue={(value) => store.updateCustomer('phone_number', value)}
               >
                  {({ openOverlay, setSearchParam, closeOverlay }) =>
                     <label>
                        <p className="text-white/50 mb-1.5">Telefono</p>

                        <TextInput
                           placeholder='+5491122334455'
                           value={store.project.customer.phone_number}
                           onFocus={() => openOverlay()}
                           onChange={(event) => {
                              setSearchParam(event.target.value);
                              store.updateCustomer('phone_number', event.target.value)
                           }}
                           onBlur={(event) => closeOverlay(event)}
                           error={!!store.errors.customer.phone_number}
                        />
                     </label>
                  }
               </CustomerSearchWrapper>

               <CustomerSearchWrapper
                  onSelectCustomer={(customer) => store.addCustomer(customer)}
                  onSelectCustomValue={(value) => store.updateCustomer('email', value)}
               >
                  {({ openOverlay, setSearchParam, closeOverlay }) =>
                     <label>
                        <p className="text-white/50 mb-1.5">Email</p>

                        <TextInput
                           placeholder='email@domain.com'
                           value={store.project.customer.email}
                           onFocus={() => openOverlay()}
                           onChange={(event) => {
                              setSearchParam(event.target.value);
                              store.updateCustomer('email', event.target.value)
                           }}
                           onBlur={(event) => closeOverlay(event)}
                           error={!!store.errors.customer.email}
                        />
                     </label>
                  }
               </CustomerSearchWrapper>
            </div>
         </fieldset>
      </section>
   )
}

interface CustomerListProps {
   pending: boolean
   customers: CustomerDomain[]
   searchParam: string
   onSelectCustomer: (customer: CustomerDomain) => void
   onSelectCustomValue: (value: string) => void
}

function CustomerList(props: CustomerListProps) {
   return (
      <ul className="flex items-center flex-col gap-2 max-h-92 h-full overflow-y-auto text-sm">
         {!props.pending && props.searchParam && (
            <li
               className="w-full flex items-center justify-center px-2 py-1 hover:bg-neutral-900 transition-colors text-center text-nowrap cursor-pointer"
               onClick={() => props.onSelectCustomValue(props.searchParam)}
            >
               {`Añadir "${props.searchParam}"`}
            </li>
         )}

         {props.pending && <li><Loader /></li>}

         {!props.pending && props.customers.map((customer) => (
            <li
               key={customer.id}
               className="w-full flex items-center justify-center px-2 py-1 hover:bg-neutral-900 transition-colors text-center text-nowrap cursor-pointer"
               onMouseDown={(event) => { event.preventDefault(); props.onSelectCustomer(customer) }}
            >
               <p className="mr-1 max-w-[32%] overflow-hidden text-ellipsis text-end">{customer.name}</p>
               {customer.username && <span className="mr-1">(@{customer.username})</span>}
               <span className='opacity-70'>{customer.phone_number ?? 'Unknown'}</span>
            </li>
         ))}
      </ul>
   )
}

interface CustomerSearchWrapperProps {
   searchPlaceholder?: string
   onSelectCustomer: (customer: CustomerDomain) => void
   onSelectCustomValue: (value: string) => void
   children: (helpers: {
      openOverlay: () => void
      closeOverlay: (event?: React.FocusEvent) => void
      setSearchParam: (value: string) => void
   }) => ReactNode
}

function CustomerSearchWrapper(props: CustomerSearchWrapperProps) {
   const [showOverlay, setShowOverlay] = useState<boolean>(false)
   const [searchParam, setSearchParam] = useState<string>('')
   const [pending, startTransition] = useTransition()
   const [customers, setCustomers] = useState<CustomerDomain[]>([])

   const mobileModalRef = useRef<HTMLDivElement>(null)
   const desktopOverlayRef = useRef<HTMLDivElement>(null)

   useEffect(() => {
      startTransition(async () => {
         const results = await findCustomers(searchParam)
         const parsedResults = results.map((customer) => new CustomerDomain({
            id: customer.id,
            name: customer.name,
            username: customer.username,
            phone_number: customer.phone_number,
            email: customer.email
         }))

         setCustomers(parsedResults)
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

   function handleSelectCustomer(customer: CustomerDomain) {
      props.onSelectCustomer(customer)
      setShowOverlay(false)
   }

   return (
      <div className='relative w-full'>
         {/*eslint-disable-next-line*/}
         {props.children({ openOverlay, setSearchParam, closeOverlay })}

         {showOverlay && (
            <RenderModal className="bg-black-primary lg:hidden" onClickOutside={() => setShowOverlay(false)}>
               <div ref={mobileModalRef} className="animation-overlay px-6 py-4 bg-black-primary flex flex-col justify-center gap-5 max-w-lg w-full h-full">
                  <h1 className="font-bold text-center text-xl">
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
            <div ref={desktopOverlayRef} className="absolute translate-y-1 border w-100 max-h-72 shadow-[0_0_10px_#ffffff10] border-gray-primary animation-overlay px-6 py-4 bg-black-primary flex flex-col justify-center gap-5 z-10">
               <SearchBar
                  placeholder={props.searchPlaceholder || 'Buscar cliente...'}
                  onChange={(event) => setSearchParam(event.target.value)}
                  classNames={{ container: 'lg:hidden' }}
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
         )}
      </div>
   )
}
