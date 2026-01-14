import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { isValidTransactionDigest } from '@mysten/sui/utils';
import { getClient } from './sui';
import { config } from '../config/env';


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const MODULE_NAME = config.MODULE_NAME
const PACKAGE_ID = config.PACKAGE_ID


//Types
interface GiftSentEvent {
    gift_db_id: string,
    sender: string,
    receiver: string,
    amount: number,
    fee_deducted: number
}



class SuiTransactionVerifier {
    client: SuiClient;
    constructor() {
        this.client = getClient();
    }

    async verifyTransaction(txDigest, { walletAddress, giftId }: { walletAddress: string, giftId: string }, options = { maxAgeMinutes: 10 }) {
        try {
            // Validate transaction digest format
            if (!isValidTransactionDigest(txDigest)) {
                throw new Error('Invalid transaction digest format');
            }

            await delay(2000)

            // Fetch transaction details
            const txResponse = await this.client.getTransactionBlock({
                digest: txDigest,
                options: {
                    showEffects: true,
                    showInput: true,
                    showEvents: true,
                },
            });
            if (!txResponse) {
                throw new Error('Transaction not found');
            }



            // Verify transaction status
            const status = txResponse.effects.status.status;
            const isSuccessful = status === 'success';

            //Verifying the sender is user walletAddress
            if (!Array.isArray(txResponse.events)) {
                return { status: false, message: "Invalid Transaction Data" };
            }

            // Verify sender
            const sender = txResponse.events.find(e => e.sender)?.sender;
            if (!sender || sender.trim() !== walletAddress) {
                return { status: false, message: "Invalid Access" };
            }



            // Verify GiftWrapped event
            const giftSentEvent = txResponse.events.find(
                event => event.type === `${PACKAGE_ID}::${MODULE_NAME}::GiftSent`
            );

            const giftSentEventParsedJson = giftSentEvent?.parsedJson as GiftSentEvent;

            if (!giftSentEvent || !giftSentEventParsedJson?.amount) {
                return { status: false, message: "Invalid Transaction" };
            }

            const giftAmount = BigInt(giftSentEventParsedJson.amount);
            if (giftAmount <= 0n) {
                return { status: false, message: "Invalid Payment Amount" };
            }

            if (giftId !== giftSentEventParsedJson.gift_db_id) {
                return { status: false, message: "Invalid Gift ID" };
            }


            // Prepare verification result
            const result = {
                verified: isSuccessful,
                status,
                digest: txDigest,
                events: txResponse.events || [],
                error: isSuccessful ? null : txResponse.effects.status.error,
            };
            // const result = {
            //     verified: isSuccessful,
            //     status,
            //     gasUsed: txResponse.effects.gasUsed,
            //     digest: txDigest,
            //     events: txResponse.events || [],
            //     error: isSuccessful ? null : txResponse.effects.status.error,
            // };


            return result;

        } catch (error) {

            throw error;
        }
    }
}

export default SuiTransactionVerifier;