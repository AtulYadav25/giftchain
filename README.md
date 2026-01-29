# Giftchain

**Giftchain** - Alternative to (BuyMeACoffee / Patreon) Like Platforms to Support Creators with Crypto on-chain

**Giftchain** is a multi-chain web application that enables users to send digital gifts using **Sui** and **Solana** blockchains. It features a unified interface for gifting, where users can send crypto gifts wrapped in digital visuals, which are then revealed by the recipient.

The Crypto Coins are directly Sent to the Reciever, Giftchain does not custody coins!

## Project Overview

- **Multi-Chain Support**: Seamlessly switch between Sui and Solana.
- **Frontend**: React + TypeScript + Vite app using a custom `multichainkit` to abstract wallet interactions.
- **Backend**: Fastify server handling user profiles, gift metadata, and transaction verification for both chains.
- **Smart Contract (Sui)**: A Move package that facilitates fee collection and gift events. On Solana, native Memo programs are used.

## Repository Layout

The codebase is organized into three main directories:

- `/client` — React + TypeScript frontend application.
- `/server` — Node.js + Fastify backend API.
- `/giftchain-sui/giftchain` — Sui Move smart contract package.

## Architecture & How it Works

### High-Level "Wrap" Logic
1.  **Sui**: A custom Move contract (`wrap_gift`) is called. It splits a fee to the treasury and transfers the gift amount *directly* to the recipient. It emits a `GiftSent` event which the backend validates on payment.
2.  **Solana**: A direct wallet transfer is constructed containing gift amount of coins and sent to the receiver with a transaction that includes Platform Fee. The backend validates on payment.


## Prerequisites

Ensure you have the following installed before starting:

- **Node.js**: v18+ recommended
- **Package Manager**: npm or pnpm
- **Git**
- **MongoDB**: Local instance or Atlas URI
- **Sui CLI**: For building and deploying smart contracts

## SUI Setup & Smart Contract

Before running the app, you must set up the Sui environment and deploy the contracts if you intend to interact with the blockchain features locally or on testnet.

### 1. Install Sui CLI
Follow the official [Sui documentation](https://docs.sui.io/guides/developer/getting-started/sui-install) to install the binaries for your OS.

### 2. Configure Network
Connect to the Sui Testnet:
```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
```

### 3. Get Testnet Tokens
Join the [Sui Discord](https://discord.gg/sui) or use the command line faucet if available for your active address:
```bash
sui client faucet
```

### 4. Deploy Smart Contract
Navigate to the contract directory:
```bash
cd giftchain-sui/giftchain
```

Build the package:
```bash
sui move build
```

Publish to Testnet:
```bash
sui client publish --gas-budget 100000000
```

**Important**: 
1. Capture the **Package ID** from the output.
2. Update the frontend `VITE_PACKAGE_ID` and backend `PACKAGE_ID` environment variables with this new ID.

## Application Setup

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGO_URI`,`PACKAGE_ID` AND `ADD YOUR CLOUDINARY ENVS`.
4. Run the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `VITE_API_URL` and `VITE_PACKAGE_ID`.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (`/server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/giftchain
SUI_NETWORK=testnet
PACKAGE_ID=0x...
```

### Frontend (`/client/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_PACKAGE_ID=0x...
VITE_SUI_NETWORK=testnet
```

## Local Development Order

To start the full stack locally:

1. **Start MongoDB** (if local).
2. **Start Backend** (`npm run dev` in `/server`).
3. **Start Frontend** (`npm run dev` in `/client`).

## License

This project is licensed under the Apache License 2.0.
