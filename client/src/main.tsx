import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ChainContextProvider } from './multichainkit/context/ChainContext.tsx';

createRoot(document.getElementById('root')!).render(
  <ChainContextProvider>
    <App />
  </ChainContextProvider>
)