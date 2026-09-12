import TattooSession, { SessionStatus } from "@/domain/TattooSession"

interface Props {
   sessionId: TattooSession['id']
   sessionStatus: TattooSession['status']
   customerName: string
   customerUsername?: string
   startsAt: Date
   endsAt: Date
   gridRow: string
}

export default function CellContentContent(props: Props) {
   return (
      <div
         style={{ gridRow: props.gridRow, gridColumn: 2 }}
         className="z-10 m-1 bg-black-secondary border border-neutral-800 rounded-lg p-3 text-xs text-white flex flex-col justify-between text-left shadow-lg"
         data-id={props.sessionId}
      >
         <div>
            <h4 className="font-bold text-white text-sm truncate">{props.customerName} {props.customerUsername ? `(@${props.customerUsername})` : ''}</h4>

            <p className={
               "text-amber-200/80 font-medium block mt-0.5" +
               (props.sessionStatus === SessionStatus.PENDING ? " text-gray-400" : "") +
               (props.sessionStatus === SessionStatus.IN_PROGRESS ? " text-orange-400" : "") +
               (props.sessionStatus === SessionStatus.FINISHED ? " text-green-400" : "") +
               (props.sessionStatus === SessionStatus.CANCELLED ? " text-red-400" : "")
            }
            >
               {props.sessionStatus}
            </p>

            <time className={
               "text-amber-200/80 font-medium block mt-0.5" +
               (props.sessionStatus === SessionStatus.PENDING ? " text-gray-400" : "") +
               (props.sessionStatus === SessionStatus.IN_PROGRESS ? " text-orange-400" : "") +
               (props.sessionStatus === SessionStatus.FINISHED ? " text-green-400" : "") +
               (props.sessionStatus === SessionStatus.CANCELLED ? " text-red-400" : "")
            }>
               {props.startsAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
               {' - '}
               {props.endsAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hs
            </time>
         </div>
      </div>
   )
}
