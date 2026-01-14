# MultichainKit

**MultichainKit** is a custom abstraction layer built into the Giftchain client to unify interactions across different blockchains (currently Sui and Solana). It provides a consistent API for checking connections, sending native tokens, and signing messages, regardless of the underlying chain.

## Core Concepts

The kit allows the application to remain agnostic to specific wallet adapters in its business logic strings.

### 1. Chain Context (`context/ChainContext.tsx`)
This is the single source of truth for the application's active chain state.
- **State**: `chain` ('sui' | 'solana').
- **Providers**: It wraps the application in *both* Sui and Solana wallet providers but conditionally exposes the active one's logic.

### 2. Transaction Abstraction (`core/Transaction.ts`)
A unified class to build and execute transactions.
- **Method**: `sendCoins(amount, recipient)` - Queues a transfer.
- **Method**: `signAndExecute()` - Detects the active chain and calls the appropriate wallet adapter method (Sui `signAndExecuteTransactionBlock` or Solana `sendTransaction`).

### 3. Chain Implementations (`chains/`)
Contains specific logic for each chain.
- **Sui**: Adapters for `@mysten/dapp-kit`.
- **Solana**: Adapters for `@solana/wallet-adapter`.

## Usage

In any component, use the `useChain` hook:

```tsx
import { useChain } from '@/multichainkit/context/ChainContext';

const App = () => {
  const { chain, setChain, isConnected } = useChain();

  return (
    <button onClick={() => setChain('solana')}>
       Switch to Solana
    </button>
  );
};
```
