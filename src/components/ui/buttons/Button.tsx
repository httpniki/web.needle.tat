import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'filled' | 'outline'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
   variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
   filled: 'border border-white/10 flex items-center justify-center gap-2 bg-gray-primary text-white transition-opacity hover:opacity-80 disabled:opacity-50',
   outline: 'border border-gray-primary text-gray-300 transition-colors hover:bg-gray-primary hover:text-white disabled:opacity-40',
}

export default function Button({
   variant = 'filled',
   type = 'button',
   className = '',
   ...props
}: Props) {
   return (
      <button
         type={type}
         className={`cursor-pointer rounded-md px-3 py-2 text-sm disabled:cursor-default ${variants[variant]} ${className}`}
         {...props}
      />
   )
}
