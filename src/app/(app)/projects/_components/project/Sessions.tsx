import TattooSession, { TattooSessionObject } from '@/domain/TattooSession'

interface Props {
   children: React.ReactNode
   onAddSession?: (session: TattooSessionObject) => void
   enableEdit?: boolean
}

export default function Sessions(props: Props) {
   function createSession() {
      if(!props.onAddSession) return

      const session = new TattooSession()
      session.id = Math.floor(Math.random() * 10000)
      props.onAddSession(session.toObject())
   }

   return (
      <section>
         <ul className='flex flex-wrap gap-6'>
            {props.children}

            {props.enableEdit &&
               <button
                  className='mt-1.5 w-full min-w-0 flex-1 basis-full rounded-sm border border-gray-primary p-6 text-sm text-nowrap hover:opacity-80 enabled:cursor-pointer disabled:opacity-25 sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]'
                  onClick={createSession}
               >
                  Agregar sesión
               </button>
            }
         </ul>
      </section>
   )
}
