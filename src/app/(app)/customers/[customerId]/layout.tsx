import type { Metadata } from 'next'

import { findCustomerById } from '@/actions/customer-actions'

interface Props {
   params: Promise<{ customerId: string }>
   children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
   const { customerId } = await params

   try {
      const customer = await findCustomerById(Number(customerId))
      return { title: customer.name }
   } catch {
      return { title: 'Cliente' }
   }
}

export default function CustomerLayout({ children }: Props) {
   return children
}
