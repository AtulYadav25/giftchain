# Giftchain Sui Module

The Move smart contract for the Giftchain application on Sui.

Unlike traditional escrow contracts, **this contract does NOT hold funds**. It facilitates a direct transfer from Sender to Receiver while ensuring a platform fee is collected and sent to the Treasury.

## Logic Flow (`wrap_gift`)

1. **Inputs**: The function takes a `Gift Coin` (for receiver) and a `Fee Coin` (for treasury).
2. **Fee Verify**: Calculates valid fee based on the gift amount and current `fee_bps` in the shared `GiftConfig`.
3. **Fee Transfer**: Splits the calculated fee and sends it to `treasury_address`.
4. **Gift Transfer**: Transfers the `Gift Coin` object immediately to the `receiver`.
5. **Event**: Emits a `GiftSent` event containing `gift_db_id` (Mongodb ID), which the backend listens for.

## Deploying

1. **Build**:
   ```bash
   sui move build
   ```
2. **Publish**:
   ```bash
   sui client publish --gas-budget 100000000
   ```
3. **Record IDs**:
   - **Package ID**: The ID of the immutable package object.
   - **GiftConfig ID**: The ID of the shared object created during `init`.

## Environment Setup
After deployment, update:
- `VITE_PACKAGE_ID` (Frontend)
- `VITE_GIFT_CONFIG` (Frontend - for fee fetching)
- `PACKAGE_ID` (Backend - for event filtering)
