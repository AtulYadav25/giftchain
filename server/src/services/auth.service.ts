import { User } from '../models/user.model';
import { signAccessToken } from '../utils/jwt';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import crypto from "crypto";
import { nanoid } from 'nanoid';

//Solana Imports
import {
    verifySignature,
    getPublicKeyFromAddress,
    SignatureBytes
} from "@solana/kit";



export const requestMessage = async (address: string, chain: string) => {
    // Generate a random 6-digit nonce
    const nonce = crypto.randomInt(100000, 999999);

    // Look for existing user
    let user = await User.findOne({ address });

    if (!user) {
        // Create new user with nonce
        user = await User.create({ address, nonce, chain, username: `gc@${nanoid()}` });
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

    const user = await User.findOne({ address });
    if (!user) throw new Error('User not found');

    if (user.chain === 'sol') {
        const messageBytes = new Uint8Array(message);
        const rawSig = Uint8Array.from(Buffer.from(signature, 'hex'));

        if (rawSig.length !== 64) {
            throw new Error('Invalid Solana signature length');
        }

        const signatureBytes = rawSig as SignatureBytes;
        try {
            const publicKey = await getPublicKeyFromAddress(address);
            const verified = await verifySignature(publicKey, signatureBytes, messageBytes);

            if (!verified) throw new Error('Signature verification failed');
        } catch (error) {
            throw new Error(`Signature verification failed: ${error.message}`);
        }
    } else if (user.chain === 'sui') {
        // Convert message to Uint8Array
        const messageBytes = new Uint8Array(message);

        // Verify signature
        let verifiedPublicKey;
        try {
            verifiedPublicKey = await verifyPersonalMessageSignature(messageBytes, signature, {
                address: address,
            });//Verify the Message is valid, also verifying the message is valid for given address
        } catch (error) {

            throw new Error(`Signature verification failed: ${error.message}`);
        }

    }


    console.log(user.chain)
    // ⏳ Token Expiry = 25 days
    const token = signAccessToken({ address, nonce, userId, chain: user.chain });

    return { user, token };
};