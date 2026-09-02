interface Props {
   onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
   onClick?: (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void
   onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
   placeholder?: string
   defaultValue?: string
   autoFocus?: boolean
   classNames?: {
      container?: string
   }
}

export default function SearchBar(props: Props) {
   return (
      <label className={
         "relative flex items-center w-full rounded-full border border-gray-primary bg-white-main text-sm px-5 py-2.5" +
         (props.classNames?.container ? ` ${props.classNames.container}` : '')
      }>
         <input
            type="text"
            id="searchbar"
            className='w-full h-full outline-none padding-none'
            placeholder={props.placeholder}
            onClick={props.onClick}
            onChange={props.onChange}
            defaultValue={props.defaultValue}
            onFocus={props.onFocus}
            autoFocus={props.autoFocus}
         />

         <span className='opacity-20'>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.3rem" height="1.3rem" viewBox="0 0 256 256">
               <path d="M0 0h256v256H0z" fill="none" />
               <path fill="currentColor" d="m229.66 218.34l-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32M40 112a72 72 0 1 1 72 72a72.08 72.08 0 0 1-72-72" />
            </svg>
         </span>
      </label>
   )
}
