import { ChangeEvent, useRef, useState } from 'react'

import RenderModal from '@/components/RenderModal'
import TattooReference, { TattooReferenceObject } from '@/domain/TattooReference'

interface Props {
   references: TattooReferenceObject[]
   onAddReference?: (reference: TattooReferenceObject) => void
   onRemoveReference?: (reference: TattooReferenceObject) => void
   loading?: string[]
   errors?: string
}

export default function References(props: Props) {
   const refInputFile = useRef<HTMLInputElement>(null)
   const [preview, setPreview] = useState<string | null>(null)

   if (preview) {
      if (props.references.length === 0) setPreview(null)
      if (props.references.length > 0 && !props.references.some((ref) => ref.url === preview)) setPreview(props.references[0].url)
   }

   if (!preview && props.references.length > 0) setPreview(props.references[0].url)

   function addImage(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0]
      if (!file) return

      const reference = new TattooReference({
         url: URL.createObjectURL(file),
         file
      })

      props.onAddReference?.(reference.toObject())
   }

   function removeReference(reference: TattooReferenceObject) {
      props.onRemoveReference?.(reference)
   }

   return (
      <section className="flex-1 rounded-sm border border-gray-primary p-6 xl:max-w-2/4">
         {(preview) && <ReferencePreview url={preview} />}

         <div className='size-full'>
            <div className='mt-1 flex items-center justify-end'>
               {props.references.length > 0 && props.errors &&
                  <div className='flex gap-2'>
                     <p className='text-sm text-red-700'>{props.errors}</p>
                  </div>
               }
            </div>

            <ul className='flex size-full min-w-0 flex-col items-start gap-2'>
               {props.references.length === 0 &&
                  <label className={'flex size-full justify-center items-center bg-black-main border border-gray-primary text-nowrap cursor-pointer hover:opacity-80 p-4 overflow-hidden' + (props.references.length === 0 ? ' max-h-54' : ' max-size-28')}>
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

                        <span className={props.references.length === 0 ? '' : 'hidden'}>
                           Añadir referencia
                        </span>
                     </span>
                  </label>
               }

               {props.references.map((ref, index) => {
                  const refNameRegex = /\.(jpg|jpeg|png|webp|wepb)/i;
                  let refName = ref.url.split('/').find((s) => refNameRegex.test(s))?.split('.')[0]
                  if (!refName) refName = ref.url

                  return (
                     <li key={index} className={'flex w-full min-w-0 justify-between gap-2 text-sm' + (index === 0 ? ' mt-2' : '')}>
                        <button
                           className="w-full cursor-pointer truncate overflow-hidden  text-start hover:opacity-80 disabled:cursor-default disabled:opacity-35"
                           key={index}
                           onClick={() => setPreview(ref.url)}
                           disabled={props.loading?.includes(ref.url)}
                        >
                           {ref.file?.name ?? refName}
                        </button>

                        {!(props.loading && props.loading.includes(ref.url)) &&
                           <button
                              className='size-max cursor-pointer rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-35'
                              onClick={() => removeReference(ref)}
                              disabled={props.loading?.includes(ref.url)}
                           >
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 width="1.2em"
                                 height="1.2em"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="2"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              >
                                 <path d="M10 11v6" />
                                 <path d="M14 11v6" />
                                 <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                 <path d="M3 6h18" />
                                 <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                           </button>
                        }
                     </li>
                  )
               })}

               {props.references.length > 0 &&
                  <label className='mx-auto'>
                     <input
                        ref={refInputFile}
                        className="hidden"
                        type="file"
                        onChange={addImage}
                     />

                     <button
                        className='cursor-pointer px-2 text-center text-sm hover:opacity-80 disabled:cursor-default disabled:opacity-35'
                        onClick={() => refInputFile.current?.click()}
                        disabled={(props.loading && props.loading.length > 0)}
                     >
                        Añadir referencia
                     </button>
                  </label>
               }
            </ul>
         </div>
      </section>
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
