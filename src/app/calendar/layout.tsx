import { Metadata } from "next"

export const metadata: Metadata = {
   title: "Calendar - Needle.tat"
}

export default function Layout({ children }: LayoutProps<"/calendar">) {
   return children
}
