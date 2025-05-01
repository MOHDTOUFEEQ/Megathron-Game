import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import App from './App.jsx'
import Game from './components/game/Game.jsx'
import Results from './components/Results.jsx'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from './Layout.jsx'
import TournamentStats from './components/TournamentStats.jsx'
import Character from './components/Character.jsx'

const router = createBrowserRouter([
  {
    path:"/",
    element: <Layout />,
    children: [
      {
        path:"",
        element: <App/>
      },
      {
        path:"Game",
        element: <Game/>
      },
      {
        path:"results",
        element: <Results/>
      },
      {
        path:"Character",
        element: <Character/>
      },

      {
        path:"tournament",
        element: <TournamentStats/>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}></RouterProvider>
    </Provider>
  </StrictMode>,
)
