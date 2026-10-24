import { Metadata } from 'next'

export const metadata: Metadata = {
   title: 'Inventario - Needle.tat'
}

export default function Layout({ children }: LayoutProps<'/inventory'>) {
   return children
}
