import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Login } from './pages/Login.tsx'
import { Signup } from './pages/Signup.tsx'
import { Home } from './pages/Home.tsx'
import { Dashboard } from './pages/admin/Dashboard.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { UserDashboard } from './pages/user/UserDashboard.tsx'
import { QuestCreate } from './pages/admin/QuestCreate.tsx'
import { Overview } from './pages/admin/Overview.tsx'
import { Participate } from './pages/admin/Participate.tsx'
import { QuestDetail } from './pages/admin/QuestDetail.tsx'
import { Challenge } from './pages/admin/Challenge.tsx'
import { DownloadApp } from './pages/DownloadApp.tsx'
import { Profile } from './pages/Profile.tsx'
import { Quests } from './pages/user/Quests.tsx'
import { Rewards } from './pages/user/Rewards.tsx'
import { UserQuestDetails } from './pages/user/UserQuestDetails.tsx'
import { Leaderboard } from './pages/user/Leaderboard.tsx'
import { UserChallanges } from './pages/user/UserChallanges.tsx'
import { VideoFeed } from './pages/user/VideoFeed.tsx'
const router = createBrowserRouter([
  {
    path: "/", element: <App />, children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "download", element: <ProtectedRoute roles={['USER','ADMIN']}><DownloadApp /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute roles={['USER','ADMIN']}><Profile /></ProtectedRoute> },
      {
        path: "", element: <Home />, children: [
          { path: "admin/dashboard", element: <ProtectedRoute roles={['ADMIN']}><Dashboard /></ProtectedRoute> },
          { path: "admin/quest/create", element: <ProtectedRoute roles={['ADMIN']}><QuestCreate /></ProtectedRoute> },
          {
            path: "admin/quest/:id", element: <ProtectedRoute roles={['ADMIN']}><QuestDetail /></ProtectedRoute>, children: [
              { path: "overview", element: <ProtectedRoute roles={['ADMIN']}><Overview /></ProtectedRoute> },
              { path: "participates", element: <ProtectedRoute roles={['ADMIN']}><Participate /></ProtectedRoute> }
            ]
          },
          {path : "admin/quest/challange",element : <ProtectedRoute roles={['ADMIN']}><Challenge/></ProtectedRoute>},
          { path: "user/dashboard", element: <ProtectedRoute roles={['USER']}><UserDashboard /></ProtectedRoute>,children : [
            {path : "quests",element : <ProtectedRoute roles={['USER']}><Quests /></ProtectedRoute>},
            {path : "rewards",element : <ProtectedRoute roles={['USER']}><Rewards /></ProtectedRoute>}
          ]},
          {path : "user/quest/:id",element : <ProtectedRoute roles={['USER']}><UserQuestDetails/></ProtectedRoute> , children : [
            {path : "progress",element : <ProtectedRoute roles={['USER']}><UserChallanges/></ProtectedRoute>},
            {path : "leaderboard",element : <ProtectedRoute roles={['USER']}><Leaderboard/></ProtectedRoute>}
          ]},
          {path : "user/quest/:id/progress/video/feed/:challengeId",element : <ProtectedRoute roles={['USER']}><VideoFeed/></ProtectedRoute>}
        ]
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
