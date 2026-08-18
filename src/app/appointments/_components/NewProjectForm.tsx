import RenderModal from "@/components/RenderModal"
import SearchBar from "@/components/ui/SearchBar"
import { useState } from "react"

interface CustomerState {
   name: string | null,
   username: string | null,
   phone_number: string | null,
}

interface CustomerSectionProps<K extends keyof CustomerState> {
   onChange: (field: K, value: CustomerState[K]) => void
}


function CustomerSection({ onChange }: CustomerSectionProps<'name' | 'username' | 'phone_number'>) {
   const [renderModal, setRenderModal] = useState<{ type: 'NAME' | 'USER' | 'PHONE_NUMBER' | null }>({ type: null })
   
   return (
      <section className="flex flex-col gap-2">
         <h6 className="font-bold">Cliente</h6>

         <div className="text-sm flex gap-2">
            <button
               onClick={() => setRenderModal({ type: 'NAME' })}
               className='cursor-pointer transition-all duration-200 hover:opacity-80'
            >
               + Añadir nombre
            </button>

            <button onClick={() => setRenderModal({ type: 'USER' })} className='cursor-pointer transition-all duration-200 hover:opacity-80'>
               (+ Añadir usuario)
            </button>

            <button onClick={() => setRenderModal({ type: 'PHONE_NUMBER' })} className='cursor-pointer transition-all duration-200 hover:opacity-80'>
               (+ Añadir telefono)
            </button>
         </div>

         {(renderModal.type) &&
            <RenderModal className='bg-black-primary' onClickOutside={() => setRenderModal({ type: null })}>
               <div className="px-6 py-4 bg-black-primary flex flex-col gap-5 max-w-96 w-full">
                  <h1 className="font-bold text-center text-xl">
                     Selecciona un cliente
                  </h1>

                  <SearchBar
                     placeholder={'Buscar ' + (renderModal.type === 'NAME' ? 'nombre' : renderModal.type === 'USER' ? 'usuario' : 'telefono') + '...'}
                     onChange={(event) => onChange(renderModal.type === 'NAME' ? 'name' : renderModal.type === 'USER' ? 'username' : 'phone_number', event.target.value)}
                  />
               </div>
            </RenderModal>
         }
      </section>
   )
}

export default function NewProjectForm() {
   const [customer, setCustomer] = useState<CustomerState>({
      name: null,
      username: null,
      phone_number: null,
   })

   return (
      <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
         <h1 className="text-lg font-bold">Nuevo tatuaje</h1>

         <CustomerSection onChange={(field, value) => console.log(field, value)} />

         <div className="flex flex-col gap-2">
            <h6 className="font-bold">Referencias</h6>

            <div className="flex gap-2">
               <button
                  className="size-28 bg-black-main border border-gray-primary text-nowrap cursor-pointer hover:opacity-80"
                  onClick={(event) => event.preventDefault()}
               >
                  +
               </button>

               {Array.from({ length: 5 }).map((_, index) => (
                  <button
                     key={index}
                     className="flex gap-2 size-28 border border-gray-primary hover:opacity-80 bg-white aspect-square cursor-pointer"
                  />
               ))}
            </div>
         </div>

         <div className="flex flex-col gap-2">
            <h6 className="font-bold">1° Sesión</h6>

            <div className='flex flex-col gap-2'>
               <label className="flex gap-2 text-sm">
                  Fecha: <button>+ Añadir fecha</button>
               </label>

               <label className="flex gap-2 text-sm">
                  Hora: <button>+ Añadir hora</button>
               </label>
            </div>
         </div>

         <button
            className='w-min cursor-pointer text-nowrap text-sm hover:opacity-80'
            onClick={(event) => event.preventDefault()}
         >
            Agregar Sesión
         </button>
      </form>
   )
}
