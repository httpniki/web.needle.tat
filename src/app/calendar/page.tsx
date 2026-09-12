import Calendar from "./_components/Calendar"
import Schedule from "./_components/Schedule"

interface Props {
   searchParams: Promise<{
      day?: number
      month?: number
      year?: number
   }>
}

export default async function CalendarPage({ searchParams }: Props) {
   const params = await searchParams

   return (
      <main className="size-full min-h-0 flex flex-1 flex-col">
         {(!params.day && !params.month && !params.year) && <Calendar />}

         {((params.day || params.month || params.year)) &&
            <Schedule
               day={Number(params.day) ?? new Date().getDate()}
               month={Number(params.month) ?? new Date().getMonth()}
               year={Number(params.year) ?? new Date().getFullYear()}
            />
         }
      </main>
   )
}
