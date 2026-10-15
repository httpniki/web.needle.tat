import { useEffect, useState } from 'react'

import RenderModal from '@/components/RenderModal'
import EditSVG from '@/components/svg/EditSVG'
import Loader from '@/components/ui/Loader'
import { SessionStatus, TattooSessionObject } from '@/domain/TattooSession'

import SchedulePicker from '../SchedulePicker'
import SessionBookingFee from './session/SessionBookingFee'
import SessionDate from './session/SessionDate'
import SessionPrice from './session/SessionPrice'
import SessionTime from './session/SessionTime'

interface Props {
   session: TattooSessionObject
   index: number
   onDelete?: (id: number) => void
   onChange?: (changes: Partial<Omit<TattooSessionObject, 'id'>>) => void
   loading?: boolean
   enableEdit?: boolean
   defaultView?: 'Input' | 'Summary'
   errors?: ({
      field: keyof Omit<TattooSessionObject, 'id'>
      message: string
   })[]
}

export default function Session(props: Props) {
   const [renderInput, setRenderInput] = useState(props.defaultView === 'Input')
   const [showPicker, setShowPicker] = useState<null | { starts_at: Date, ends_at: Date }>(null)

   useEffect(() => {
      if (!renderInput || !props.enableEdit) return

      function onClickOutside(event: MouseEvent) {
         const target = event.target as HTMLElement
         if (!target || target.closest(`#session-${props.session.id}`)) return
         setRenderInput(false)
      }

      document.addEventListener('click', onClickOutside)
      return () => document.removeEventListener('click', onClickOutside)
   }, [renderInput])

   function toggleStatus() {
      const now = new Date()
      const inProgress = (props.session.starts_at <= now && props.session.ends_at > now)
      const isPending = props.session.starts_at > now

      switch (props.session.status) {
         case SessionStatus.PENDING:
            props.onChange?.({ status: SessionStatus.CANCELED })
            break
         case SessionStatus.IN_PROGRESS:
            props.onChange?.({ status: SessionStatus.FINISHED })
            break
         case SessionStatus.FINISHED:
            props.onChange?.({ status: SessionStatus.CANCELED })
            break
         case SessionStatus.CANCELED:
            if(inProgress) props.onChange?.({ status: SessionStatus.IN_PROGRESS })
            else if (isPending) props.onChange?.({ status: SessionStatus.PENDING })
            else props.onChange?.({ status: SessionStatus.FINISHED })
            break
      }
   }

   return (
      <li id={`session-${props.session.id}`} className='flex-1 basis-full rounded-sm border border-gray-primary p-6 sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]'>
         <div>
            <div className='flex items-center gap-2'>
               <header className="mb-2 flex w-full items-center justify-between">
                  <div className='flex items-center gap-2'>
                     <h6 className="font-bold text-nowrap">{props.index + 1}° Sesión</h6>

                     <button
                        onClick={toggleStatus}
                        className={'text-sm rounded-sm cursor-pointer transition-colors duration-200 hover:opacity-80' +
                           (props.session.status === SessionStatus.PENDING ? ' text-gray-400' : '') +
                           (props.session.status === SessionStatus.IN_PROGRESS ? ' text-orange-400' : '') +
                           (props.session.status === SessionStatus.FINISHED ? ' text-green-400' : '') +
                           (props.session.status === SessionStatus.CANCELED ? ' text-red-400' : '')
                        }
                     >
                        {props.session.status === SessionStatus.PENDING && 'Pendiente'}
                        {props.session.status === SessionStatus.IN_PROGRESS && 'En progreso'}
                        {props.session.status === SessionStatus.CANCELED && 'Cancelado'}
                        {props.session.status === SessionStatus.FINISHED && 'Finalizado'}
                     </button>

                     {props.loading && <Loader size='16px' />}
                  </div>

                  <div className='flex items-center gap-2'>
                     {(props.enableEdit) &&
                        <button
                           onClick={() => setRenderInput((prev) => !prev)}
                           className='cursor-pointer transition-opacity duration-200 hover:opacity-80 disabled:cursor-default disabled:opacity-0'
                           disabled={renderInput}
                        >
                           <EditSVG size='1em' />
                        </button>
                     }

                     <button
                        onClick={() => props.onDelete?.(props.session.id)}
                        className='cursor-pointer transition-opacity duration-200 hover:opacity-80 disabled:cursor-default disabled:opacity-35'
                        disabled={props.loading}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
                           <path d="M0 0h24v24H0z" fill="none" />
                           <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 16l-4-4m0 0L8 8m4 4l4-4m-4 4l-4 4" />
                        </svg>
                     </button>
                  </div>
               </header>
            </div>

            <div className='flex flex-col gap-3 text-sm'>
               <SessionDate
                  showButton={renderInput}
                  date={props.session.starts_at}
                  error={props.errors?.find(el => el.field === 'starts_at')?.message}
                  onClick={() => setShowPicker({ starts_at: props.session.starts_at, ends_at: props.session.ends_at })}
               />

               <SessionTime
                  showButton={renderInput}
                  starts_at={props.session.starts_at}
                  ends_at={props.session.ends_at}
                  error={props.errors?.find(el => el.field === 'ends_at')?.message}
                  onClick={() => setShowPicker({ starts_at: props.session.starts_at, ends_at: props.session.ends_at })}
               />

               <SessionPrice
                  showInput={renderInput}
                  currency={props.session.currency}
                  price={props.session.price}
                  onChangeCurrency={(currency) => props.onChange?.({ currency })}
                  onChangePrice={(price) => props.onChange?.({ price })}
                  error={props.errors?.find(el => el.field === 'price')?.message}
               />

               <div className='flex items-center gap-4 text-sm text-nowrap'>
                  <SessionBookingFee
                     showInput={renderInput}
                     booking_fee={props.session.booking_fee}
                     onChange={(booking_fee) => props.onChange?.({ booking_fee })}
                     error={props.errors?.find(el => el.field === 'booking_fee')?.message}
                  />

                  <p>Restante: ${props.session.price - props.session.booking_fee}</p>
               </div>
            </div>
         </div>

         {(showPicker) &&
            <RenderModal onClickOutside={() => setShowPicker(null)}>
               <SchedulePicker
                  initialStartsAt={props.session.starts_at}
                  initialEndsAt={props.session.ends_at}
                  onClose={() => setShowPicker(null)}
                  onSelectAppointment={(starts_at, ends_at) => {
                     props.onChange?.({ starts_at, ends_at })
                     setShowPicker(null)
                  }}
               />
            </RenderModal>
         }
      </li>
   )
}
