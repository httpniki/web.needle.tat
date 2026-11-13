'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import Navbar from './Navbar'
import Topbar, { type AccountSummary } from './Topbar'

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

interface AppShellProps {
   children: React.ReactNode
   account: AccountSummary
}

export default function AppShell({ children, account }: AppShellProps) {
   const [hidden, setHidden] = useState(false)
   const [title, setTitle] = useState('')

   return (
      <AppShellContext.Provider value={{ title, setTitle }}>
         <div className='flex min-h-0 flex-1 flex-col-reverse bg-black-primary md:flex-row'>
            <Navbar hidden={hidden} isOwner={account.role === 'owner'} />

            <div className='flex min-h-0 min-w-0 flex-1 flex-col bg-black-primary'>
               <Topbar hidden={hidden} title={title} account={account} onToggle={() => setHidden((prev) => !prev)} />

               <div className='relative flex min-h-0 min-w-0 flex-1 overflow-y-auto'>
                  {children}
               </div>
            </div>
         </div>
      </AppShellContext.Provider>
   )
}
