import { Metadata } from "next"

export const metadata: Metadata = {
   title: "Stock - Needle.tat"
}

export default function Layout({ children }: LayoutProps<"/stock">) {
   return children
}
