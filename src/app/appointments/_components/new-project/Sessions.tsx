import DateInput from "@/components/ui/inputs/DateInput"
import NumberInput from "@/components/ui/inputs/NumberInput"
import TimeInput from "@/components/ui/inputs/TimeInput"
import useNewProject from "../../_context/NewProjectContext"
import SessionData, { Currency } from "@/domain/TattooSession"
import { ClassProperties } from "@/types/types"
import { add, format, parse } from "date-fns"

export default function Sessions() {
   const store = useNewProject()

   return (
      <section className='w-full lg:max-w-125 border border-gray-primary rounded-sm p-6'>
         <div className="flex flex-col gap-6 mb-2">
            {store.project.sessions.map((session, index) => (
               <div key={session.id}>
                  {index > 0 && <hr className='border-gray-primary my-2' />}
                  <Session key={session.id} data={session} index={index} />
               </div>
            ))}
         </div>

         <button
            className='w-min mt-1.5 enabled:cursor-pointer text-nowrap text-sm hover:opacity-80 disabled:opacity-25'
            onClick={() => store.addNewSession()}
         >
            Agregar sesión
         </button>
      </section >
   )
}

type SessionProps = {
   data: {
      [K in keyof ClassProperties<SessionData>]: SessionData[K]
   }
   index: number
}

function Session(props: SessionProps) {
   const store = useNewProject()
   const { id: _id, ...rest } = store.errors.sessions.find((s) => s.id === props.data.id) ?? {}
   const error = Object.values(rest).find((s) => s)

   return (
      <div>
         <div className='flex gap-2 items-center'>
            <div className="w-full flex items-center justify-between mb-2">
               <h6 className="font-bold text-nowrap">Sesion {props.index + 1}</h6>

               <button onClick={() => store.removeSession(props.data.id)} className='cursor-pointer transition-opacity duration-200 hover:opacity-80'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
                     <path d="M0 0h24v24H0z" fill="none" />
                     <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 16l-4-4m0 0L8 8m4 4l4-4m-4 4l-4 4" />
                  </svg>
               </button>
            </div>
         </div>
         <div className='flex flex-col gap-3 text-sm'>
            <div className="flex items-center gap-1.5 w-40">
               <p>Fecha:</p>

               <DateInput
                  value={format(props.data.starts_at, 'dd/MM/yyyy')}
                  onChange={(date) => {
                     let newDate = parse(date, 'dd/MM/yyyy', new Date())

                     newDate = add(newDate, {
                        hours: props.data.starts_at.getHours(),
                        minutes: props.data.starts_at.getMinutes()
                     })

                     store.updateSession('starts_at', newDate, props.data.id)
                  }}
                  error={!!store.errors.sessions.find((s) => s.id === props.data.id)?.starts_at}
               />
            </div>

            <div className="flex items-center gap-1.5 w-44">
               <p>Hora:</p>

               <TimeInput
                  value={format(props.data.starts_at, 'HH:mm')}
                  onChange={(time) => {
                     const newTime = parse(time, 'HH:mm', props.data.starts_at)
                     store.updateSession('starts_at', newTime, props.data.id)
                  }}
                  error={!!store.errors.sessions.find((s) => s.id === props.data.id)?.starts_at || !!store.errors.sessions.find((s) => s.id === props.data.id)?.ends_at}
               />

               <p> - </p>

               <TimeInput
                  value={format(props.data.ends_at, 'HH:mm')}
                  onChange={(time) => {
                     const newTime = parse(time, 'HH:mm', props.data.starts_at)
                     store.updateSession('ends_at', newTime, props.data.id)
                  }}
                  error={!!store.errors.sessions.find((s) => s.id === props.data.id)?.ends_at}
               />
            </div>

            <div className='flex items-center gap-1.5 text-sm w-48'>
               <p>Precio:</p>

               <select
                  className={
                     'outline-none bg-black-primary text-white cursor-pointer' +
                     (store.errors.sessions.find((s) => s.id === props.data.id)?.currency ? " border-red-700" : "")
                  }
                  value={props.data.currency}
                  onChange={(event) => {
                     const currency = event.target.value as Currency
                     store.updateSession('currency', currency, props.data.id)
                  }}
               >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
               </select>

               <span>$</span>

               <NumberInput
                  value={props.data.price}
                  onChange={(price) => store.updateSession('price', price, props.data.id)}
                  error={!!store.errors.sessions.find((s) => s.id === props.data.id)?.price}
               />
            </div>

            {(error) &&
               <p className='text-sm text-red-500 text-nowrap text-ellipsis overflow-hidden'>
                  * {error}
               </p>
            }
         </div>
      </div>
   )
}
