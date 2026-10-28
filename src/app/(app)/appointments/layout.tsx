import { Metadata } from 'next'

export const metadata: Metadata = {
   title: 'Turnos - Needle.tat'
}

export default function Layout({ children }: LayoutProps<'/appointments'>) {
   return children
}
