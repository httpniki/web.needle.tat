import { useRouter } from 'next/navigation'

import TattooProject from '@/domain/TattooProject'
import TattooSession, { SessionStatus } from '@/domain/TattooSession'
import { formatPrice } from '@/utils/utils'

interface Props {
   onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
   onContextMenu?: (event: React.MouseEvent<HTMLButtonElement>) => void
   session: {
      id: TattooSession['id']
      projectId: TattooProject['id']
      status: TattooSession['status']
      price: TattooSession['price']
      currency: TattooSession['currency']
      bookingFee: TattooSession['booking_fee']
      startsAt: Date
      endsAt: Date
   }
   customer: {
      name: string
      username?: string
   }
   gridRow: string
   highlighted?: boolean
   interactive?: boolean
}

export default function CellContentContent(props: Props) {
   const total = formatPrice(props.session.price)
   const price = formatPrice(props.session.price - props.session.bookingFee)
   const router = useRouter()

   return (
      <button
         style={{
            gridRow: props.gridRow,
            gridColumn: 2,
            pointerEvents: props.interactive === false ? 'none' : undefined
         }}
         className={
            'z-10 m-1 flex cursor-pointer flex-col justify-between rounded-lg border border-neutral-800 bg-black-secondary p-3 text-left text-white shadow-lg transition-all hover:opacity-80' +
            (props.highlighted ? ' ring-2 ring-white/60' : '')
         }
         onClick={() => router.push('/projects?id=' + props.session.projectId)}
         onContextMenu={props.onContextMenu}
         data-id={props.session.id}
      >
         <div>
            <div className="flex items-center justify-between">
               <h4 className="truncate text-sm font-bold text-white">{props.customer.name} {props.customer.username ? `(@${props.customer.username})` : ''}</h4>

               <p className='flex gap-1'>
                  <span className={props.session.bookingFee !== 0 ? 'text-red-400 line-through' : 'hidden'}>
                     ${total}
                  </span>

                  <span>
                     ${price}
                  </span>
               </p>
            </div>

            <p className={
               'text-amber-200/80 text-sm font-medium block' +
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
            </p>

            <time className={
               'text-amber-200/80 text-sm font-medium block' +
               (props.session.status === SessionStatus.PENDING ? ' text-gray-400' : '') +
               (props.session.status === SessionStatus.IN_PROGRESS ? ' text-orange-400' : '') +
               (props.session.status === SessionStatus.FINISHED ? ' text-green-400' : '') +
               (props.session.status === SessionStatus.CANCELED ? ' text-red-400' : '')
            }>
               {props.session.startsAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
               {' - '}
               {props.session.endsAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hs
            </time>
         </div>
      </button>
   )
}
