import type { Metadata } from 'next'

export const metadata: Metadata = {
   title: 'Artistas - Needle.tat'
}

export default function Layout({ children }: LayoutProps<'/artists'>) {
   return children
}
