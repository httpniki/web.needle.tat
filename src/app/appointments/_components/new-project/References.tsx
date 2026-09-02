import RenderModal from "@/components/RenderModal"
import useNewProject from "../../_context/NewProjectContext"
import Image from "next/image"
import { ChangeEvent, useState } from "react"

export default function References() {
   const store = useNewProject()

   function addImage(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0]
      if (!file) return

      store.addReference(file)
   }

   return (
      <section className="flex flex-col gap-2 border border-gray-primary rounded-sm p-6">
         <h6 className="font-bold text-nowrap">Referencias</h6>

         <ul className="flex gap-2">
            <label className="flex justify-center items-center size-28 bg-black-main border border-gray-primary text-nowrap cursor-pointer hover:opacity-80">
               <input
                  className="hidden"
                  type="file"
                  onChange={addImage}
               />

               <span>+</span>
            </label>

            {store.references.map((file, index) => (
               <Reference
                  key={index}
                  file={file}
                  index={index}
                  onDelete={() => store.removeReference(index)}
               />
            ))}
         </ul>
      </section>
   )
}

interface ReferenceProps {
   file: File
   index: number
   onDelete: () => void
}

function Reference(props: ReferenceProps) {
   const url = URL.createObjectURL(props.file)
   const [showPreview, setShowPreview] = useState(false)

   return (
      <li>
         <button
            className="border border-gray-primary hover:opacity-80 aspect-square cursor-pointer"
            onClick={() => setShowPreview(!showPreview)}
         >
            <Image
               src={url}
               alt={props.file.name}
               width={112}
               height={112}
               className='object-cover aspect-square'
            />
         </button>

         {showPreview &&
            <RenderModal
               onClickOutside={() => setShowPreview(false)}
            >
               <div className='flex items-center justify-center group m-4 max-h-[75vh] max-w-[75vw] size-fit overflow-hidden bg-black-primary'>
                  <img
                     src={url}
                     alt={props.file.name}
                     className="block max-w-full max-h-[75vh] w-auto h-auto object-contain"
                  />

                  <button
                     className='absolute h-max w-max inset-2/4 -translate-x-2/4 -translate-y-2/4 cursor-pointer transition-opacity duration-200 group-hover:opacity-100 opacity-0 p-3 bg-black/70 rounded-full'
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
