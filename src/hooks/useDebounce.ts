import { useRef } from 'react'

export default function useDebounce(delay: number) {
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

   return (callback: () => void) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(callback, delay)
   }
}
