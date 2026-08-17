import Link from "next/link";

export default function Topbar() {
   return (
      <div className="sticky bg-black-primary h-12 top-0 inset-x-0 z-10 flex items-center justify-start border-b border-gray-primary">
         <Link href="/" className="flex text-lg items-center gap-2 px-4 py-2 text-white transition-colors duration-200 hover:opacity-80 cursor-pointer font-bold">
            Needle.tat
         </Link>
      </div>
   )
}
