import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@mysten/dapp-kit/dist/index.css';

import { SolanaProviderWrapper } from './multichainkit/chains/solana/SolanaProviderWrapper.tsx';
import { SuiProviderWrapper } from './multichainkit/chains/sui/SuiProviderWrapper.tsx';
import { ChainContextProvider } from './multichainkit/context/ChainContext.tsx';



createRoot(document.getElementById('root')!).render(

  <SolanaProviderWrapper>
    <SuiProviderWrapper>
      <ChainContextProvider>
        <App />
      </ChainContextProvider>
    </SuiProviderWrapper>
  </SolanaProviderWrapper>
)
