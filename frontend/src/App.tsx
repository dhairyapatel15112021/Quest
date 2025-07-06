import { Outlet } from 'react-router-dom'
import './App.css'
import { RecoilRoot } from 'recoil'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { UseAuthCheck } from './components/UseAuthCheck';
import { Loader } from './components/Loader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

function App() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className='overflow-hidden'>
      <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <ToastContainer />
        <UseAuthCheck setIsChecked={setIsChecked} />
        {
          !isChecked ? <Loader /> :
            <>
              <Outlet />
            </>
        }
      </RecoilRoot>
      </QueryClientProvider>
    </div>
  )
}

export default App
