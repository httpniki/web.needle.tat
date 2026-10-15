import { Metadata } from 'next'

export const metadata: Metadata = {
   title: 'Projectos - Needle.tat'
}

export default function Layout({ children }: LayoutProps<'/projects'>) {
   return children
}
