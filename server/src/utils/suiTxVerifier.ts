import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { isValidTransactionDigest } from '@mysten/sui/utils';
import { getClient } from './sui';


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const SUI_NETWORK = process.env.SUI_NETWORK; // Store securely in environment variables
const MODULE_NAME = process.env.MODULE_NAME
const PACKAGE_ID = process.env.PACKAGE_ID


//Types
interface GiftWrappedEvent {
    gift_db_id: string,
    sender: string,
    receiver: string,
    amount: number,
    fee_deducted: number
}

interface PlatformFeeCollectedEvent {
    gift_db_id: string,
    amount: number
}


interface GiftClaimedEvent {
    gift_db_id: String,
    claimer: String,
    amount: number
}


class SuiTransactionVerifier {
    client: SuiClient;
    constructor(network = SUI_NETWORK) {
        this.client = getClient('testnet');
    }

    async verifyTransaction(txDigest, { walletAddress, giftDbId, verifyType }: { walletAddress: string, giftDbId: string, verifyType: 'wrapGift' | 'claimGift' }, options = { maxAgeMinutes: 10 }) {
        try {
            // Validate transaction digest format
            if (!isValidTransactionDigest(txDigest)) {
                throw new Error('Invalid transaction digest format');
            }

            await delay(3000)

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


            if (verifyType === 'wrapGift') {

                // Verify GiftWrapped event
                const giftWrappedEvent = txResponse.events.find(
                    event => event.type === `${PACKAGE_ID}::${MODULE_NAME}::GiftWrapped`
                );

                const giftWrappedEventParsedJson = giftWrappedEvent?.parsedJson as GiftWrappedEvent;

                if (!giftWrappedEvent || !giftWrappedEventParsedJson?.amount) {
                    return { status: false, message: "Invalid Transaction" };
                }

                const giftAmount = BigInt(giftWrappedEventParsedJson.amount);
                if (giftAmount <= 0n) {
                    return { status: false, message: "Invalid Payment Amount" };
                }

                if (giftDbId !== giftWrappedEventParsedJson.gift_db_id) {
                    return { status: false, message: "Invalid Gift ID" };
                }

            }

            if (verifyType === 'claimGift') {

                // Verify GiftUnwrapped event
                const giftClaimedEvent = txResponse.events.find(
                    event => event.type === `${PACKAGE_ID}::${MODULE_NAME}::GiftClaimed`
                );

                const giftClaimedEventParsedJson = giftClaimedEvent?.parsedJson as GiftClaimedEvent;

                if (!giftClaimedEvent || !giftClaimedEventParsedJson?.amount) {
                    return { status: false, message: "Invalid Transaction" };
                }

                const giftAmount = BigInt(giftClaimedEventParsedJson.amount);
                if (giftAmount <= 0n) {
                    return { status: false, message: "Invalid Payment Amount" };
                }

                if (giftDbId !== giftClaimedEventParsedJson.gift_db_id) {
                    return { status: false, message: "Invalid Gift ID" };
                }
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