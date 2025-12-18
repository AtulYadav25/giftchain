"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSolViaMPC = exports.getSolBalance = void 0;
const web3_js_1 = require("@solana/web3.js");
const env_1 = require("../config/env");
// import { IkaSDK, IkaWallet } from '@ika.xyz/sdk'; // Hypothetical import based on search
// MOCKING the Ika SDK logic for now as documentation is not fully available in training data context,
// but structuring it exactly as requested for MPC flow.
const connection = new web3_js_1.Connection(env_1.config.SOLANA_RPC_URL, 'confirmed');
const getSolBalance = async (address) => {
    const pubKey = new web3_js_1.PublicKey(address);
    const balance = await connection.getBalance(pubKey);
    return balance;
};
exports.getSolBalance = getSolBalance;
/**
 * Simulate MPC Signing with Ika/dWallet
 * In a real scenario, this would interact with the dWallet Network to sign the transaction parts.
 */
const sendSolViaMPC = async (recipient, amountLamports) => {
    // 1. Initialize MPC Session / dWallet
    // const dWallet = await IkaSDK.getUnknownWallet({ ...credentials });
    // const pubKey = dWallet.publicKey; 
    // For demonstration, we will use a local Keypair to simulate the "MPC Result" signature
    // since we don't have a live MPC network connection in this environment.
    // IN PRODUCTION: Replace this with actual Ika SDK signing call.
    if (!env_1.config.IKA_PRIVATE_KEY)
        throw new Error("IKA_PRIVATE_KEY not set for MPC simulation");
    // Simulation: Use a local key as if it was the MPC controlled key
    // The 'IKA_PRIVATE_KEY' in env would represent the server's share or full key for testing.
    const signer = web3_js_1.Keypair.fromSecretKey(Buffer.from(env_1.config.IKA_PRIVATE_KEY, 'base64'));
    const fromPubkey = signer.publicKey;
    // 2. Create Solana Transaction
    const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey,
        toPubkey: new web3_js_1.PublicKey(recipient),
        lamports: amountLamports,
    }));
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;
    // 3. Sign via Ika MPC (Simulated)
    // const signature = await dWallet.sign(transaction.serializeMessage());
    // transaction.addSignature(fromPubkey, signature);
    transaction.sign(signer); // Local sign for simulation
    // 4. Broadcast via Solana RPC
    const signatureConfig = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signatureConfig);
    return { signature: signatureConfig };
};
exports.sendSolViaMPC = sendSolViaMPC;
