import type { Metadata } from 'next'

export const metadata: Metadata = {
   title: {
      default: 'Clientes - Needle.tat',
      template: '%s - Needle.tat'
   }
}

export default function CustomersLayout({ children }: LayoutProps<'/customers'>) {
   return children
}
