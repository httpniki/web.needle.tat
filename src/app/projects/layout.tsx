import type { Metadata } from 'next'

export const metadata: Metadata = {
   title: 'Projectos - Needle.tat'
}

export default function ProjectsLayout({ children }: LayoutProps<'/projects'>) {
   return children
}
