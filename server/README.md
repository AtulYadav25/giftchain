# Giftchain Server

The centralized API for Giftchain that augments the on-chain activity. It manages user data, gift metadata (messages, themes), and verifies blockchain transactions for both Sui and Solana.

## Key Features

- **Multi-Chain Verification**:
  - **Sui**: Verifies transactions by checking for `GiftSent` events emitted by the Move package.
  - **Solana**: Verifies transactions by decoding the Memo instruction linked to the signature.
- **User Profiles**: Links Sui and Solana addresses to a single user identity.
- **Gift Metadata**: Stores off-chain data like personal messages and unwrap status.

## Tech Stack

- **Node.js**: Runtime environment.
- **Fastify**: High-performance web framework.
- **MongoDB**: Primary data store.
- **Mongoose**: ODM for MongoDB.
- **Zod**: Runtime type validation.

## Environment Variables

Copy `.env.example` to `.env`. key variables:

```ini
# Core
PORT=5000
MONGO_URI=mongodb://localhost:27017/giftchain
JWT_SECRET=supersecret

# Networks
SUI_NETWORK=testnet
SOLANA_NETWORK=testnet

# Sui Specific
PACKAGE_ID=0x... # The ID of the deployed Move package

# Solana Specific
# (Validation relies on public RPCs defined in code or utils)
```

## Transaction Verification

The server uses specialized utility classes for verification:
- `src/utils/solanaTxVerifier.ts`: Fetches tx from RPC, decodes Memo, matches amounts.
- `src/utils/suiTxVerifier.ts`: Queries events from Sui RPC filtered by Package ID.

## Running Development

```bash
npm install
npm run dev
```
