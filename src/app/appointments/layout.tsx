import { Metadata } from "next"

export const metadata: Metadata = {
   title: "Appointments - Needle.tat"
}

export default function Layout({ children }: LayoutProps<"/appointments">) {
   return children
}
