import { useRouter } from "next/navigation"

interface Props {
   starts_date: Date
   ends_date: Date
}

export default function SlotSelectionMenu(props: Props) {
   const router = useRouter()
   const url = `/appointments?new=true&starts_date=${props.starts_date.toISOString()}&ends_date=${props.ends_date.toISOString()}`

   return (
      <div className="absolute bottom-0 left-0 right-0 p-6 z-1000 bg-black-primary flex flex-col gap-2 rounded-lg shadow-[0_0_10px_#ffffff10]">
         <button
            className='w-full border border-white py-3 hover:opacity-80 transition-all cursor-pointer animation-slide-up rounded-sm'
            onClick={() => router.push(url)}
         >
            Añadir cita
         </button>
      </div>
   )
}
