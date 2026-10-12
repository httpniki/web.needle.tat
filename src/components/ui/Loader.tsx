interface Props {
   className?: string
   size?: number | string
}

export default function Loader(props: Props) {
   return (
      <span
         style={{ width: props.size ?? 24, height: props.size ?? 24 }}
         className={'inline-block border-2 border-black-main rounded-full border-t-transparent border-r-transparent border-b-transparent animate-spin' + (props.className ? ` ${props.className}` : '')}
      />
   )
}
