// main.jsx
import '@solana/wallet-adapter-react-ui/styles.css'; 
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './index.css';

import App from './App.jsx';
import Game from './components/game/Game.jsx';
import Results from './components/Results.jsx';
import Character from './components/Character.jsx';
import TournamentStats from './components/TournamentStats.jsx';
import Layout from './Layout.jsx';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const rpcUrl = 'https://api.devnet.solana.com';
const wallets = [new PhantomWalletAdapter()];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "",         element: <App /> },
      { path: "game",     element: <Game /> }, 
      { path: "results",  element: <Results /> },
      { path: "character",element: <Character /> }, 
      { path: "tournament", element: <TournamentStats /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ConnectionProvider endpoint={rpcUrl}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <RouterProvider router={router} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </Provider>
  </StrictMode>
);
