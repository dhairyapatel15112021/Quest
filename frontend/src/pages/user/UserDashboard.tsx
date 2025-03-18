
import { NavLink, Outlet } from 'react-router-dom';

export const UserDashboard = () => {
  
  return (
    <div className='h-fit md:h-[90vh] w-screen bg-[#f8f7f3] flex flex-col items-center justify-center'>
      <div className='w-full h-fit flex items-center justify-center gap-6 text-black border-b-[0.7px] border-gray-300'>
        <NavLink to="quests" className={({ isActive }) => `${isActive ? 'border-b-[2px] border-black text-black font-medium' : 'text-gray-500 font-light hover:border-b-[2px] hover:border-gray-300 duration-50'} py-3 h-full transition-all duration-200 tracking-wide`}>Quests</NavLink>
        <NavLink to="rewards" className={({ isActive }) => `${isActive ? 'border-b-[2px] border-black text-black font-medium' : 'text-gray-500 font-light hover:border-b-[2px] hover:border-gray-300 duration-50'} py-3 h-full transition-all duration-200 tracking-wide`}>Rewards</NavLink>
      </div>
      <div className='w-full md:w-[40vw] h-full overflow-y-scroll'>
        <Outlet />
      </div>
    </div>
  )
}
