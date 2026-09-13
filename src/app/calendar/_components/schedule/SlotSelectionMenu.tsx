import { useRouter } from 'next/navigation'

interface Props {
   starts_date: Date
   ends_date: Date
}

export default function SlotSelectionMenu(props: Props) {
   const router = useRouter()
   const url = `/appointments?new=true&starts_date=${props.starts_date.toISOString()}&ends_date=${props.ends_date.toISOString()}`

   return (
      <div className="absolute inset-x-0 bottom-0 z-1000 flex flex-col gap-2 rounded-lg bg-black-primary p-6 shadow-[0_0_10px_#ffffff10]">
         <button
            className='animation-slide-up w-full cursor-pointer rounded-sm border border-white/20 bg-gray-primary py-3 transition-all hover:border-white/12'
            onClick={() => router.push(url)}
         >
            Añadir cita
         </button>
      </div>
   )
}
