import { createSolanaClient, SolClient } from './solana';
import { Signature } from '@solana/kit';
import { Gift } from '../models/gift.model';
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
        { walletAddress }: { walletAddress: string }
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


            /* -------------------------------------------------
               2️⃣ Extract Gift IDs from Memo (NOT trusted for amounts)
            ------------------------------------------------- */
            let giftIds: string[] = [];

            for (const instr of txAny.message.instructions ?? []) {
                if (
                    instr.programId?.toString() === MEMO_PROGRAM_ID &&
                    typeof instr.parsed === 'string'
                ) {
                    try {
                        const parsed = JSON.parse(instr.parsed);
                        if (Array.isArray(parsed?.giftIds)) {
                            giftIds = parsed.giftIds;
                            break;
                        }
                    } catch {
                        /* ignore malformed memo */
                    }
                }
            }

            if (!giftIds.length) {
                return { status: false, message: 'Gift IDs not found in memo' };
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

            for (const giftId of giftIds) {
                const gift = await Gift.findById(giftId);
                if (!gift) {
                    return { status: false, message: `Gift ${giftId} not found` };
                }

                if (gift.status !== 'unverified') {
                    return { status: false, message: `Gift ${giftId} already processed` };
                }

                if (gift.senderWallet !== walletAddress) {
                    return { status: false, message: `Sender mismatch for gift ${giftId}` };
                }

                const matchIndex = transfers.findIndex(
                    t =>
                        t.to === gift.receiverWallet &&
                        t.lamports === gift.totalTokenAmount
                );

                if (matchIndex === -1) {
                    return {
                        status: false,
                        message: `On-chain transfer not found for gift ${giftId}`,
                    };
                }

                // consume transfer (prevents reuse)
                transfers.splice(matchIndex, 1);

                verifiedGifts.push({
                    gift_db_id: giftId,
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
                status: true,
                message: 'Transaction verified successfully',
                giftObjs: verifiedGifts,
                giftIds: giftIds,
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
