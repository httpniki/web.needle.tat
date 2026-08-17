'use client'

export default function CreateAppointment() {
   return (
      <main>
         <form className="flex flex-col gap-6">
            <h1 className="text-lg font-bold">Nuevo tatuaje</h1>

            <div className="flex flex-col gap-2">
               <h6 className="font-bold">Cliente</h6>

               <div className="text-sm flex gap-2">
                  <p>+ Añadir nombre</p>
                  <p>(+ Añadir usuario)</p>
                  <p>(+ Añadir Telefono)</p>
               </div>
            </div>

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
      </main>
   )
}
