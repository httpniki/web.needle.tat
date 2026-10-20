import Link from 'next/link'

export default function ProjectNotFound() {
   return (
      <section className='flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 p-4 text-center md:px-8'>
         <div className='flex size-16 items-center justify-center rounded-full border border-gray-primary bg-black-secondary text-white/70'>
            <svg className='size-8' viewBox="0 0 24 24" fill="currentColor">
               <path d="M20 6H12L10.59 4.59C10.21 4.21 9.7 4 9.17 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM20 18H4V8H20V18ZM13.59 10L15 11.41L13.41 13L15 14.59L13.59 16L12 14.41L10.41 16L9 14.59L10.59 13L9 11.41L10.41 10L12 11.59L13.59 10Z" />
            </svg>
         </div>

         <div>
            <h1 className='text-xl font-bold'>Proyecto no encontrado</h1>

            <p className='mt-1 text-sm text-white/70'>
               El proyecto que buscás no existe o fue eliminado.
            </p>
         </div>

         <Link
            href='/projects'
            className='rounded-md border border-gray-primary bg-black-secondary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80'
         >
            Volver a proyectos
         </Link>
      </section>
   )
}
