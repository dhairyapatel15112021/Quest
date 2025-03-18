interface CardProps {
  title: string;
  numericData: number;
  isLoading?: boolean;
}

export const Card = ({ title, numericData, isLoading = false }: CardProps) => {
  return (
    <>
      {
        isLoading ? 
          <div className='w-full h-[8vh] md:h-full rounded-md bg-[#ecd1b2] relative overflow-hidden'>
            <div className='animate-shimmer absolute inset-0 bg-gradient-to-r from-[#ecd1b2] via-[#e0e0e0] to-[#ecd1b2] bg-[length:700px_100%]'></div>
            <div className='relative px-5 py-2 flex flex-col gap-2'>
              <div className='h-7 w-16 bg-[#e4e4e4] rounded'></div>
              <div className='h-5 w-32 bg-[#e4e4e4] rounded'></div>
            </div>
          </div>
          :
          <div className={`w-full h-[8vh] md:h-full px-5 py-2 flex flex-col justify-center gap-2 items-start bg-[#ecd1b2] text-black transition duration-200 border border-[#ecd1b2] hover:bg-[white] hover:text-[#0b421a] rounded-md`}>
            <div className='text-2xl font-light md:font-medium'>{numericData}</div>
            <div className='text-base font-extralight md:font-light flex items-center gap-2'>
              {/* <div aria-label="warning" className="status status-warning"></div> */}
              <div>{title}</div>
            </div>
          </div>
      }
    </>
  )
}
