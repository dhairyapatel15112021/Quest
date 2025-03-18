
import { UserQuestBanner } from './UserQuestBanner'
import { Outlet } from 'react-router-dom'

export const UserQuestDetails = () => {
    return (
        <div className='h-[90vh] w-screen bg-[#f8f7f3] px-10 py-2 flex flex-col'>
            <UserQuestBanner />
            <div className='flex-1 overflow-y-auto'>
                <Outlet />
            </div>
        </div>
    )
}
