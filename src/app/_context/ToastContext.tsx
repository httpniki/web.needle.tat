'use client'

import { createContext, useContext, useState } from "react"

type Toast = {
   title?: string
   message: string
   type: 'success' | 'error'
}

type ToastState = Toast & { id: string }

type StoreState = {
   toasts: ToastState[]
}

type StoreActions = {
   add: (toast: Toast) => void
}

export const ToastContext = createContext<(StoreState & StoreActions) | null>(null)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
   const [toasts, setToasts] = useState<ToastState[]>([])

   function addToast(toast: Toast) {
      const id = crypto.randomUUID()
      const newToast = { ...toast, id }

      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
         setToasts(prev => prev.filter((t) => t.id !== id))
      }, 5000)
   }

   return (
      <ToastContext.Provider value={{ toasts, add: addToast }}>
         {children}
         <div className='fixed bottom-5 right-5 z-50 w-full max-w-sm flex flex-col gap-4'>
            {toasts.map((toast) => (
               <Toast key={toast.id} message={toast.message} type={toast.type} title={toast.title} />
            ))}
         </div>
      </ToastContext.Provider>
   )
}

export function useToast() {
   const context = useContext(ToastContext)
   if (!context) throw new Error('ToastContext not found')

   return context
}

interface ToastProps {
   message: string
   type: 'success' | 'error'
   title?: string
}

function Toast({ message, type, title }: ToastProps) {
   return (
      <div className='animation-slide-up w-full border border-gray-primary p-4 bg-black-secondary rounded-sm text-center'>
         {(title) &&
            <h6 className={'text-lg mb-1.5' + (type === 'error' ? ' text-red-500' : ' text-white')}>
               {title}
            </h6>
         }
         <p>{message}</p>
      </div>
   )
}
