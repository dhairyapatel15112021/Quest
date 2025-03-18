export const Unauthorised = () => { 
    return (
        <div className='w-full h-[90vh] flex justify-center items-center'>
            <div className="relative py-[10vh]">
                <div className="container mx-auto">
                    <div className="-mx-4 flex">
                        <div className="w-full px-4">
                            <div className="mx-auto max-w-[400px] text-center">
                                <h2 className="mb-2 text-[50px] font-bold leading-none text-black sm:text-[80px] md:text-[100px]">
                                    403
                                </h2>
                                <h4 className="mb-3 text-[22px] font-semibold leading-tight text-black">
                                    Oops! You are not authorised to view this page
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
