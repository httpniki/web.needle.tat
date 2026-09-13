import Image from 'next/image'
import { ChangeEvent, useState } from 'react'

import RenderModal from '@/components/RenderModal'

import useNewProject from '../../_context/NewProjectContext'

export default function References() {
   const store = useNewProject()

   function addImage(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0]
      if (!file) return

      store.addReference(file)
   }

   return (
      <section className="flex flex-col gap-2 rounded-sm border border-gray-primary p-6">
         <h6 className="font-bold text-nowrap">Referencias</h6>

         <ul className="flex gap-2">
            <label className={'flex justify-center items-center bg-black-main border border-gray-primary text-nowrap cursor-pointer hover:opacity-80' + (store.project.references.length === 0 ? ' w-full h-54' : ' size-28')}>
               <input
                  className="hidden"
                  type="file"
                  onChange={addImage}
               />

               <span className='flex flex-col items-center gap-1 text-white/50'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 1024 1024">
                     <path d="M0 0h1024v1024H0z" fill="none" />
                     <path fill="currentColor" d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7M790.2 326H602V137.8zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216zM544 472c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v108H372c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h108v108c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V644h108c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H544z" />
                  </svg>

                  <span className={store.project.references.length === 0 ? '' : 'hidden'}>
                     Añadir referencia
                  </span>
               </span>
            </label>

            {store.project.references.map((ref, index) => {
               if (!ref.file) throw new Error('File is null')

               return <Reference
                  key={index}
                  file={ref.file}
                  url={ref.url}
                  index={index}
                  onDelete={() => store.removeReference(ref.url)}
               />
            })}
         </ul>
      </section>
   )
}

interface ReferenceProps {
   file: File
   url: string
   index: number
   onDelete: () => void
}

function Reference(props: ReferenceProps) {
   const [showPreview, setShowPreview] = useState(false)

   return (
      <li>
         <button
            className="aspect-square cursor-pointer border border-gray-primary hover:opacity-80"
            onClick={() => setShowPreview(!showPreview)}
         >
            <Image
               src={props.url}
               alt={props.file.name}
               width={112}
               height={112}
               className='aspect-square object-cover'
            />
         </button>

         {showPreview &&
            <RenderModal
               onClickOutside={() => setShowPreview(false)}
            >
               <div className='group m-4 flex size-fit max-h-[75vh] max-w-[75vw] items-center justify-center overflow-hidden bg-black-primary'>
                  <img
                     src={props.url}
                     alt={props.file.name}
                     className="block size-auto max-h-[75vh] max-w-full object-contain"
                  />

                  <button
                     className='absolute inset-2/4 size-max -translate-2/4 cursor-pointer rounded-full bg-black/70 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100'
                     onClick={props.onDelete}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="1.6rem" height="1.6rem" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" />
                     </svg>
                  </button>
               </div>
            </RenderModal>
         }
      </li>
   )
}
