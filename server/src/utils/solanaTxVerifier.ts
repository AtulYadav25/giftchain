import { createSolanaClient, SolClient } from './solana';
import { Signature } from '@solana/kit';
import { IGift } from '../models/gift.model';
import { config } from '../config/env';

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class SolTransactionVerifier {
    client: SolClient;

    constructor() {
        this.client = createSolanaClient();
    }

    async verifyTransaction(
        txSignature: Signature,
        { walletAddress }: { walletAddress: string },
        gifts: IGift[]
    ) {
        try {
            if (typeof txSignature !== 'string') {
                throw new Error('Invalid transaction signature');
            }

            await delay(3000);
            const txResponse = await this.client.rpc
                .getTransaction(txSignature, {
                    encoding: 'jsonParsed',
                    maxSupportedTransactionVersion: 0,
                })
                .send();


            if (!txResponse) {
                throw new Error('Transaction not found');
            }


            if (txResponse.meta?.err) {
                return { status: false, message: 'Transaction failed on-chain' };
            }

            const txAny = txResponse.transaction as any;


            /* -------------------------------------------------
               1️⃣ Verify fee payer (sender)
            ------------------------------------------------- */
            const feePayer = txAny.message?.accountKeys?.[0];
            if (!feePayer.pubkey || feePayer.pubkey.toString() !== walletAddress) {
                return { status: false, message: 'Invalid sender (fee payer mismatch)' };
            }

            if (!gifts.length) {
                return { status: false, message: 'Gifts not found' };
            }

            /* -------------------------------------------------
               3️⃣ Extract actual System transfers (SOURCE OF TRUTH)
            ------------------------------------------------- */
            const transfers: { to: string; lamports: number }[] = [];

            for (const instr of txAny.message.instructions ?? []) {
                if (instr.program === 'system' && instr.parsed?.type === 'transfer') {
                    transfers.push({
                        to: instr.parsed.info.destination,
                        lamports: Number(instr.parsed.info.lamports),
                    });
                }
            }

            if (!transfers.length) {
                return { status: false, message: 'No SOL transfers found in transaction' };
            }

            /* -------------------------------------------------
               4️⃣ Verify each Gift against transaction reality
               - DB used ONLY for intent + state
               - Amount & receiver verified on-chain
            ------------------------------------------------- */
            const verifiedGifts = [];

            for (const gift of gifts) {

                if (gift.status !== 'unverified') {
                    return { status: false, message: `Gift already processed` };
                }

                if (gift.senderWallet !== walletAddress) {
                    return { status: false, message: `Sender mismatch for gift` };
                }

                const matchIndex = transfers.findIndex(
                    t =>
                        t.to.toString() === gift.receiverWallet.toString() &&
                        t.lamports === gift.totalTokenAmount
                );

                if (matchIndex === -1) {
                    return {
                        status: false,
                        message: `On-chain transfer not found for gift`,
                    };
                }

                // consume transfer (prevents reuse)
                transfers.splice(matchIndex, 1);

                verifiedGifts.push({
                    gift_db_id: gift._id,
                    gift_obj_id: 'sol_tx_verified',
                    amount: gift.totalTokenAmount,
                });
            }

            /* -------------------------------------------------
               5️⃣ TODO : (Optional) verify platform fee transfer here
            ------------------------------------------------- */
            /* -------------------------------------------------
   5️⃣ Verify platform fee transfer (1%)
------------------------------------------------- */
            const treasuryAddress = config.SOL_FEE_COLLECTOR_ADDRESS;
            if (!treasuryAddress) {
                throw new Error('Treasury address not configured');
            }

            // Sum total gift lamports (already verified on-chain)
            const totalGiftLamports = verifiedGifts.reduce(
                (sum, g) => sum + Number(g.amount),
                0
            );

            // Calculate required fee (1%)
            const requiredFeeLamports = Math.floor(totalGiftLamports * 0.01);

            // Find fee transfer
            const feeTransferIndex = transfers.findIndex(
                t =>
                    t.to === treasuryAddress &&
                    t.lamports >= requiredFeeLamports
            );

            if (feeTransferIndex === -1) {
                return {
                    status: false,
                    message: 'Platform fee not paid or insufficient',
                };
            }

            // Consume fee transfer (prevents reuse)
            // transfers.splice(feeTransferIndex, 1);



            return {
                verified: true,
                status: true,
                message: 'Transaction verified successfully',
                giftObjs: verifiedGifts,
                giftIds: gifts.map((gift: any) => gift._id.toString()),
            };
        } catch (error: any) {
            return {
                status: false,
                message: error?.message || 'Verification failed',
            };
        }
    }
}

export default SolTransactionVerifier;
