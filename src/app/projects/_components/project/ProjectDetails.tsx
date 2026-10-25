import TextInput from '@/components/ui/inputs/TextInput'

interface Props {
   projectName: string
   onChange?: (value: string) => void
   enableEdit?: boolean
   defaultView?: 'Input' | 'Summary'
}

export default function ProjectDetails(props: Props) {
   const renderInput = props.defaultView === 'Input'

   return (
      <section className='flex w-full flex-col gap-2 rounded-sm border border-gray-primary p-6'>
         <h6 className='font-bold'>Detalles del proyecto</h6>

         <div className='flex flex-col gap-1 text-sm'>
            <p className='text-white/50'>Título</p>

            <div className='flex min-w-0 items-center gap-2'>
               {(!renderInput && props.defaultView === 'Summary') &&
                  <p className='truncate'>{props.projectName || 'Sin título'}</p>
               }

               {renderInput &&
                  <TextInput
                     id='project-title'
                     placeholder='Ej: Dragón en el antebrazo'
                     value={props.projectName}
                     onChange={(event) => props.onChange?.(event.target.value)}
                  />
               }
            </div>
         </div>
      </section>
   )
}
