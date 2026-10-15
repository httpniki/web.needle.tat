import { Metadata } from 'next'

export const metadata: Metadata = {
   title: 'Calendario - Needle.tat'
}

export default function Layout({ children }: LayoutProps<'/calendar'>) {
   return children
}
