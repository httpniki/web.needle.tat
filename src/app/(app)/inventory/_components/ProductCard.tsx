import Loader from '@/components/ui/Loader'
import { Product } from '@/domain/inventory/Product'

interface ProductCardProps {
   product: Product
   isUpdating: boolean
   isDeleting: boolean
   onIncrease: (quantity: number) => void
   onDecrease: (quantity: number) => void
   onDelete: () => void
}

export default function ProductCard(props: ProductCardProps) {
   return (
      <article className='flex size-full flex-col justify-between gap-4 rounded-md border border-gray-primary bg-black-secondary p-4 shadow-lg'>
         <div className='flex items-start justify-between gap-3'>
            <div className='flex min-w-0 flex-col gap-0.5'>
               <h2 className='truncate text-base font-semibold text-white'>
                  {props.product.name}
               </h2>

               <p className='truncate text-xs text-gray-400'>
                  Marca: {props.product.brand}
               </p>
            </div>

            <div className='flex shrink-0 items-center gap-1.5'>
               <span className='rounded-full border border-gray-primary bg-neutral-900 px-2.5 py-1 text-[11px] text-gray-300'>
                  {props.product.type.value}
               </span>

               <button
                  type='button'
                  aria-label={`Eliminar ${props.product.name}`}
                  disabled={props.isUpdating || props.isDeleting}
                  className='flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-primary bg-black-primary text-red-500 transition-colors hover:border-red-500/40 hover:text-red-500/80 disabled:cursor-default disabled:opacity-40'
                  onClick={props.onDelete}
               >
                  {props.isDeleting ? (
                     <Loader size='14px' />
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className='size-4'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />
                     </svg>
                  )}
               </button>
            </div>
         </div>

         <div className='flex items-center justify-between gap-3 border-t border-gray-primary/80 pt-4'>
            <StockBadge stock={props.product.stock} />

            {props.isUpdating
               ? (
                  <p className='w-full max-w-40 text-center'>
                     <Loader size='16px' />
                  </p>
               )
               : (
                  <div className='flex items-center gap-1.5'>
                     <button
                        type='button'
                        aria-label={`Decrementar stock de ${props.product.name} en 10`}
                        disabled={props.product.stock < 10 || props.isDeleting}
                        className='flex h-8 cursor-pointer items-center justify-center rounded-md border border-gray-primary bg-black-primary px-2 font-mono text-xs text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:cursor-default disabled:opacity-40'
                        onClick={() => props.onDecrease(10)}
                     >
                        -10
                     </button>

                     <button
                        type='button'
                        aria-label={`Decrementar stock de ${props.product.name}`}
                        disabled={props.product.stock === 0 || props.isDeleting}
                        className='flex size-8 cursor-pointer items-center justify-center rounded-md border border-gray-primary bg-black-primary text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:cursor-default disabled:opacity-40'
                        onClick={() => props.onDecrease(1)}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className='size-4'>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                     </button>

                     <button
                        type='button'
                        aria-label={`Incrementar stock de ${props.product.name}`}
                        disabled={props.isDeleting}
                        className='flex size-8 cursor-pointer items-center justify-center rounded-md border border-gray-primary bg-black-primary text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:cursor-default disabled:opacity-40'
                        onClick={() => props.onIncrease(1)}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className='size-4'>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                     </button>

                     <button
                        type='button'
                        aria-label={`Incrementar stock de ${props.product.name} en 10`}
                        disabled={props.isDeleting}
                        className='flex h-8 cursor-pointer items-center justify-center rounded-md border border-gray-primary bg-black-primary px-2 font-mono text-xs text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:cursor-default disabled:opacity-40'
                        onClick={() => props.onIncrease(10)}
                     >
                        +10
                     </button>
                  </div>
               )}
         </div>
      </article>
   )
}

function StockBadge({ stock }: { stock: number }) {
   if (stock === 0) {
      return (
         <span className='rounded-sm border border-red-500/30 px-2.5 py-2 text-xs text-red-400'>
            Sin stock
         </span>
      )
   }

   if (stock <= 5) {
      return (
         <span className='flex items-center justify-center gap-1.5 rounded-sm px-2.5 py-2 text-xs text-amber-600'>
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="18"
               height="18"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            >
               <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
               <path d="M12 9v4" />
               <path d="M12 17h.01" />
            </svg>

            Stock bajo · {stock}
         </span>
      )
   }

   return (
      <span className='rounded-sm px-2.5 py-2 text-xs text-emerald-500'>
         {stock} unidades
      </span>
   )
}


