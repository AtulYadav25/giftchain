import { User } from '../models/user.model';
import { signAccessToken } from '../utils/jwt';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import crypto from "crypto";


export const requestMessage = async (address: string) => {
    // Generate a random 6-digit nonce
    const nonce = crypto.randomInt(100000, 999999);

    // Look for existing user
    let user = await User.findOne({ address });

    if (!user) {
        // Create new user with nonce
        user = await User.create({ address, nonce });
    } else {
        // Update nonce for existing user
        user.nonce = nonce;
        await user.save();
    }

    // Authentication message the user must sign
    const message = `Welcome to GiftChain!\nNonce: ${nonce}`;

    return {
        message,
        nonce,
        userId: user._id,
    };
};

export const verify = async (data: any) => {
    const { address, message, signature, nonce, userId } = data;
    console.log(data)

    const user = await User.findOne({ address });
    if (!user) throw new Error('User not found');

    // Convert message to Uint8Array
    const messageBytes = new Uint8Array(message);

    // Verify signature
    let verifiedPublicKey;
    try {
        verifiedPublicKey = await verifyPersonalMessageSignature(messageBytes, signature, {
            address: address,
        });//Verify the Message is valid, also verifying the message is valid for given address
    } catch (error) {
        console.error("Signature verification error:", error.message);

        throw new Error(`Signature verification failed: ${error.message}`);
    }


    // ⏳ Token Expiry = 25 days
    const token = signAccessToken({ address, nonce, userId });

    return { user, token };
};
