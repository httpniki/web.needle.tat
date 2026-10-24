'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface InputSelectOption {
   value: string
   label: string
}

interface Props {
   options: InputSelectOption[]
   value: string
   onChange: (value: string) => void
   id?: string
   placeholder?: string
   error?: boolean
   disabled?: boolean
}

export default function InputSelect(props: Props) {
   const [isOpen, setIsOpen] = useState(false)
   const [activeIndex, setActiveIndex] = useState(-1)
   const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties | null>(null)

   const containerRef = useRef<HTMLDivElement>(null)
   const buttonRef = useRef<HTMLButtonElement>(null)
   const dropdownRef = useRef<HTMLUListElement>(null)
   const optionRefs = useRef<(HTMLLIElement | null)[]>([])
   const listboxId = useId()

   const selectedOption = props.options.find((option) => option.value === props.value)

   useEffect(() => {
      if (!isOpen) return

      function handleClickOutside(event: MouseEvent) {
         const target = event.target as Node
         if (containerRef.current?.contains(target)) return
         if (dropdownRef.current?.contains(target)) return

         closeDropdown()
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [isOpen])

   useEffect(() => {
      if (!isOpen) return

      function updatePosition() {
         setDropdownStyle(getDropdownPosition())
      }

      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)

      return () => {
         window.removeEventListener('resize', updatePosition)
         window.removeEventListener('scroll', updatePosition, true)
      }
   }, [isOpen])

   useEffect(() => {
      if (!isOpen || activeIndex < 0) return

      optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
   }, [isOpen, activeIndex])

   function getDropdownPosition(): React.CSSProperties {
      if (!buttonRef.current) return {}

      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const openAbove = spaceBelow < 240 && spaceAbove > spaceBelow
      const availableSpace = openAbove ? spaceAbove : spaceBelow
      const position: React.CSSProperties = {
         position: 'fixed',
         left: rect.left,
         width: rect.width,
         maxHeight: Math.min(240, Math.max(80, availableSpace - 8))
      }

      if (openAbove) position.bottom = window.innerHeight - rect.top + 4
      if (!openAbove) position.top = rect.bottom + 4

      return position
   }

   function openDropdown() {
      const selectedIndex = props.options.findIndex((option) => option.value === props.value)

      setDropdownStyle(getDropdownPosition())
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
      setIsOpen(true)
   }

   function closeDropdown() {
      setIsOpen(false)
      setActiveIndex(-1)
      setDropdownStyle(null)
   }

   function selectOption(option: InputSelectOption) {
      props.onChange(option.value)
      closeDropdown()
      buttonRef.current?.focus()
   }

   function handleButtonClick() {
      if (props.disabled) return
      if (isOpen) closeDropdown()
      if (!isOpen) openDropdown()
   }

   function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
      if (props.disabled) return

      switch (event.key) {
         case 'ArrowDown':
            event.preventDefault()
            if (!isOpen) {
               openDropdown()
               return
            }
            setActiveIndex((currentIndex) => currentIndex < props.options.length - 1 ? currentIndex + 1 : 0)
            break
         case 'ArrowUp':
            event.preventDefault()
            if (!isOpen) {
               openDropdown()
               return
            }
            setActiveIndex((currentIndex) => currentIndex > 0 ? currentIndex - 1 : props.options.length - 1)
            break
         case 'Home':
            if (!isOpen) return
            event.preventDefault()
            setActiveIndex(0)
            break
         case 'End':
            if (!isOpen) return
            event.preventDefault()
            setActiveIndex(props.options.length - 1)
            break
         case 'Enter':
         case ' ':
            event.preventDefault()
            if (!isOpen) {
               openDropdown()
               return
            }
            if (activeIndex >= 0 && props.options[activeIndex]) selectOption(props.options[activeIndex])
            break
         case 'Escape':
            if (!isOpen) return
            event.preventDefault()
            closeDropdown()
            break
         case 'Tab':
            closeDropdown()
            break
      }
   }

   return (
      <div ref={containerRef} className='relative w-full'>
         <button
            ref={buttonRef}
            id={props.id}
            type='button'
            role='combobox'
            aria-haspopup='listbox'
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
            disabled={props.disabled}
            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-black-secondary px-3 py-2 text-left text-sm transition-colors outline-none disabled:cursor-default disabled:opacity-50 ${props.error ? 'border-red-700' : 'border-gray-primary focus:border-white/40'} ${isOpen ? 'border-white/40' : ''}`}
            onClick={handleButtonClick}
            onKeyDown={handleKeyDown}
         >
            <span className={selectedOption ? 'truncate text-white' : 'truncate text-gray-500'}>
               {selectedOption?.label ?? props.placeholder ?? 'Seleccionar'}
            </span>

            <svg
               className={`size-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
               xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24"
               strokeWidth="2"
               stroke="currentColor"
            >
               <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
         </button>

         {isOpen && dropdownStyle && createPortal(
            <ul
               ref={dropdownRef}
               id={listboxId}
               role='listbox'
               aria-labelledby={props.id}
               style={dropdownStyle}
               className='z-10001 overflow-y-auto rounded-md border border-gray-primary bg-black-secondary p-1 shadow-[0_0_10px_#ffffff10]'
            >
               {props.options.length === 0 && (
                  <li className='px-3 py-2 text-sm text-gray-500'>
                     Sin opciones
                  </li>
               )}

               {props.options.map((option, index) => {
                  const isSelected = option.value === props.value

                  return (
                     <li
                        key={option.value}
                        ref={(element) => { optionRefs.current[index] = element }}
                        id={`${listboxId}-option-${index}`}
                        role='option'
                        aria-selected={isSelected}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm transition-colors ${index === activeIndex ? 'bg-gray-primary text-white' : 'text-gray-300'} ${isSelected ? 'font-semibold' : ''}`}
                        onClick={() => selectOption(option)}
                        onMouseEnter={() => setActiveIndex(index)}
                     >
                        <span className='truncate'>
                           {option.label}
                        </span>

                        {isSelected && (
                           <svg className='size-4 shrink-0 text-white' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                           </svg>
                        )}
                     </li>
                  )
               })}
            </ul>,
            document.body
         )}
      </div>
   )
}
