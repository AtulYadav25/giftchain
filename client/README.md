# Giftchain Client

The React frontend for Giftchain. It features a custom multi-chain architecture to handle wallet connections and interactions for both Sui and Solana.

## Project Structure

- `src/multichainkit` - Custom abstraction layer for multi-chain wallet management (see [src/multichainkit/README.md](src/multichainkit/README.md)).
- `src/hooks` - React hooks for app logic.
- `src/pages` - Route components.

## Multichain Architecture

The app does not rely on a single wallet provider. Instead, it uses a **ChainContext** to toggle the active chain.
- **Sui**: Uses `@mysten/dapp-kit`.
- **Solana**: Uses `@solana/wallet-adapter`.

## Environment Variables

Check `.env.example`. You must configure specifics for both chains:

```ini
VITE_API_URL=http://localhost:5000

# Sui
VITE_SUI_NETWORK=testnet
VITE_PACKAGE_ID=0x...
VITE_GIFT_CONFIG=0x...

# Solana
VITE_SOLANA_NETWORK=testnet
```

## Running Locally

```bash
npm install
npm run dev
```
