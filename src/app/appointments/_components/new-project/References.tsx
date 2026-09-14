import { ChangeEvent, useRef, useState } from 'react'

import RenderModal from '@/components/RenderModal'

import useNewProject from '../../_context/NewProjectContext'

export default function References() {
   const store = useNewProject()
   const refInputFile = useRef<HTMLInputElement>(null)
   const [preview, setPreview] = useState<string | null>(null)

   if (preview) {
      if (store.project.references.length === 0) setPreview(null)
      if (store.project.references.length > 0 && !store.project.references.some((ref) => ref.url === preview)) setPreview(store.project.references[0].url)
   }

   if (!preview && store.project.references.length > 0) setPreview(store.project.references[0].url)


   function addImage(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0]
      if (!file) return

      store.addReference(file)
   }

   return (
      <section className="flex w-full flex-col gap-2 rounded-sm border border-gray-primary p-6 xl:max-w-2/4">
         {(preview) && <ReferencePreview url={preview} />}

         <div>
            <div className='flex items-center justify-end'>
               {store.project.references.length > 0 &&
                  <label>
                     <input
                        ref={refInputFile}
                        className="hidden"
                        type="file"
                        onChange={addImage}
                     />

                     <button className='cursor-pointer hover:opacity-80'
                        onClick={() => refInputFile.current?.click()}
                     >
                        Añadir referencia
                     </button>
                  </label>
               }
            </div>

            <ul className='flex flex-col items-start gap-2'>
               {store.project.references.length === 0 &&
                  <label className={'flex justify-center items-center bg-black-main border border-gray-primary text-nowrap cursor-pointer hover:opacity-80' + (store.project.references.length === 0 ? ' w-full h-54' : ' size-28')}>
                     <input
                        ref={refInputFile}
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
               }

               {store.project.references.map((ref, index) => {
                  return (
                     <li key={index} className={'flex w-full justify-between gap-2 text-sm' + (index === 0 ? ' mt-2' : '')}>
                        <button
                           className="w-full cursor-pointer truncate text-start hover:opacity-80"
                           key={index}
                           onClick={() => setPreview(ref.url)}
                        >
                           {ref.file?.name ?? ref.url}
                        </button>

                        <button
                           className='size-max cursor-pointer rounded-full transition-opacity duration-200 hover:opacity-80'
                           onClick={() => store.removeReference(ref.url)}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24">
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" />
                           </svg>
                        </button>
                     </li>
                  )
               })}
            </ul>
         </div>
      </section >
   )
}

interface ReferencePreviewProps {
   url: string
}

function ReferencePreview(props: ReferencePreviewProps) {
   const [showPreview, setShowPreview] = useState(false)

   return (
      <div className='h-86 w-full overflow-hidden'>
         <button
            className="size-full cursor-pointer"
            onClick={() => setShowPreview(!showPreview)}
         >
            <img
               src={props.url}
               alt='preview'
               className="m-auto size-full object-contain"
            />
         </button>

         {showPreview &&
            <RenderModal
               onClickOutside={() => setShowPreview(false)}
            >
               <div className='group m-4 flex size-fit max-h-[75vh] max-w-[75vw] items-center justify-center overflow-hidden bg-black-primary'>
                  <img
                     src={props.url}
                     alt='image-view'
                     className="block size-auto max-h-[75vh] max-w-full object-contain"
                  />
               </div>
            </RenderModal>
         }
      </div>
   )
}
