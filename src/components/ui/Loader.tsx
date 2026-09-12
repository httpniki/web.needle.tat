interface Props {
   className?: string
}

export default function Loader(props: Props) {
   return (
      <span
         className={"inline-block w-6 h-6 border-2 border-black-main rounded-full border-t-transparent border-r-transparent border-b-transparent animate-spin" + (props.className ? ` ${props.className}` : '')}
      />
   )
}
