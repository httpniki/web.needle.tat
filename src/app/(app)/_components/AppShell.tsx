'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import Navbar from './Navbar'
import Topbar from './Topbar'

interface AppShellContextValue {
   title: string
   setTitle: (title: string) => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

export function usePageHeader(title: string) {
   const context = useContext(AppShellContext)

   if (!context) throw new Error('AppShellContext not found')

   useEffect(() => {
      context.setTitle(title)
   }, [context.setTitle, title])
}

export default function AppShell({ children }: { children: React.ReactNode }) {
   const [hidden, setHidden] = useState(false)
   const [title, setTitle] = useState('')

   return (
      <AppShellContext.Provider value={{ title, setTitle }}>
         <div className='flex min-h-0 flex-1 flex-col-reverse md:flex-row md:bg-black-secondary'>
            <Navbar hidden={hidden} />

            <div className='flex min-h-0 min-w-0 flex-1 flex-col bg-black-primary md:mt-2 md:rounded-t-2xl'>
               <Topbar hidden={hidden} title={title} onToggle={() => setHidden((prev) => !prev)} />

               <div className='relative flex min-h-0 min-w-0 flex-1 overflow-y-auto'>
                  {children}
               </div>
            </div>
         </div>
      </AppShellContext.Provider>
   )
}
