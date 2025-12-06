# GiftChain Backend

Full backend server for GiftChain application.

## Tech Stack
- Node.js & Fastify
- TypeScript
- MongoDB (Mongoose)
- Redis (Optional, not implemented in base v1)
- Zod Validation
- JWT Auth
- Sui SDK
- Ika SDK (Solana MPC)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment:
   Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `SUI_PRIVATE_KEY`
   - `IKA_PRIVATE_KEY`

3. Run Development Server:
   ```bash
   npm run dev
   ```

4. Build for Production:
   ```bash
   npm run build
   npm start
   ```

## API Structure

- `/auth/*`: Login, Signup, Me
- `/gifts/*`: Send, Receive, Open
- `/wrappers/*`: Upload, View
- `/payments/*`: SUI/SOL Blockchain operations
