import { Outlet } from 'react-router-dom'
import './App.css'
import { RecoilRoot } from 'recoil'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { UseAuthCheck } from './components/UseAuthCheck';
import { Loader } from './components/Loader';

function App() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className='overflow-hidden'>
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
    </div>
  )
}

export default App
