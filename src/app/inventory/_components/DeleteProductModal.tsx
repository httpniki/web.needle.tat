import RenderModal from '@/components/RenderModal'
import Loader from '@/components/ui/Loader'
import { Product } from '@/domain/inventory/Product'

interface Props {
   product: Product
   isDeleting: boolean
   onConfirm: () => void
   onClose: () => void
}

export default function DeleteProductModal({ product, isDeleting, onConfirm, onClose }: Props) {
   return (
      <RenderModal onClickOutside={onClose}>
         <div className='mx-4 flex w-full max-w-sm flex-col rounded-lg border border-gray-primary bg-black-secondary shadow-2xl'>
            <header className='flex flex-col gap-1 border-b border-gray-primary p-4'>
               <h2 id='delete-product-title' className='text-lg font-bold'>
                  Eliminar producto
               </h2>

               <p className='text-sm text-gray-400'>
                  Esta acción no se puede deshacer.
               </p>
            </header>

            <p className='p-4 text-sm text-gray-300'>
               ¿Seguro que querés eliminar <span className='font-semibold text-white'>{product.name}</span>?
            </p>

            <footer className='flex justify-end gap-2 border-t border-gray-primary p-4'>
               <button
                  type='button'
                  autoFocus
                  disabled={isDeleting}
                  className='cursor-pointer rounded-md border border-gray-primary px-3 py-2 text-sm text-gray-300 transition-colors hover:opacity-85 disabled:cursor-default disabled:opacity-40'
                  onClick={onClose}
               >
                  Cancelar
               </button>

               <button
                  type='button'
                  disabled={isDeleting}
                  className='flex cursor-pointer items-center justify-center gap-2 rounded-md border border-red-800 px-3 py-2 text-sm font-semibold text-red-800 transition-colors hover:opacity-85 disabled:cursor-default disabled:opacity-50'
                  onClick={onConfirm}
               >
                  {isDeleting ? <Loader size='16px' /> : 'Eliminar'}
               </button>
            </footer>
         </div>
      </RenderModal>
   )
}
