interface Props {
    className?: string;
}

export const Coffee = ({ className = "" }: Props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75v18m-7.5-18v18m-6-13.5h19.5m-19.5 0c0 2.485 2.099 4.5 4.688 4.5s4.687-2.015 4.687-4.5c0-2.485-2.098-4.5-4.687-4.5-2.59 0-4.688 2.015-4.688 4.5Z" />
        </svg>
    );
}; 