import { Gift } from '../models/gift.model';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Transaction } from '@mysten/sui/transactions';
import { getClient } from '../utils/sui';
import { createHash } from 'crypto';

const client = getClient('testnet');

export const createGift = async (senderId: string, data: any) => {
    const gift = await Gift.create({
        senderId,
        senderWallet: data.senderWallet,
        receiverWallet: data.receiverWallet,

        amountUSD: data.amountUSD, // In USD eg: 100 USD
        totalTokenAmount: Number(data.totalTokenAmount), // In SUI(MIST) eg: 1.154 SUI but stored 11545558885
        tokenSymbol: data.tokenSymbol, // 'sui'
        feeUSD: data.feeUSD, // In USD eg: 1 USD
        suiStats: data.suiStats,

        wrapper: data.wrapper,
        message: data.message,

        status: 'unverified',
        verified: false,

        senderTxHash: null,
        deliveryTxHash: null,

        chainID: data.chainID, // 'sui' 
        isAnonymous: false
    });

    return gift;
};
type GiftObj = {
    gift_db_id: string;
    gift_obj_id: string;
    amount: number;
};

export const verifyGifts = async (giftObjs: GiftObj[]) => {
    const giftIds = giftObjs.map(g => g.gift_db_id.toString());

    // Lookup maps (MIST everywhere)
    const amountMap = new Map(
        giftObjs.map(g => [g.gift_db_id.toString(), Number(g.amount)])
    );

    const giftObjIdMap = new Map(
        giftObjs.map(g => [g.gift_db_id.toString(), `0x${g.gift_obj_id}`])
    );

    console.log(giftObjIdMap)
    // Fetch only what we need
    const gifts = await Gift.find(
        { _id: { $in: giftIds } },
        { totalTokenAmount: 1 }
    ).lean();

    // 1️⃣ Ensure all gifts exist
    if (gifts.length !== giftObjs.length) {
        throw new Error('Gift count mismatch');
    }

    // 2️⃣ Verify amounts (MIST → MIST)
    const isVerified = gifts.every(gift => {
        const expectedAmount = amountMap.get(gift._id.toString());
        if (expectedAmount == null) return false;

        return gift.totalTokenAmount === expectedAmount;
    });

    if (!isVerified) {
        throw new Error('Gifts not verified');
    }

    // 3️⃣ Mark verified + store on-chain IDs
    await Gift.bulkWrite(
        gifts.map(gift => ({
            updateOne: {
                filter: { _id: gift._id },
                update: {
                    $set: {
                        status: 'sent',
                        verified: true,
                        onChainGiftId: giftObjIdMap.get(gift._id.toString()),
                    },
                },
            },
        }))
    );
};



export const getSentGifts = async (
    address: string,
    page = 1,
    limit = 10
) => {
    const skip = (page - 1) * limit;

    const data = await Gift.aggregate([
        // 1️⃣ Match sender wallet
        {
            $match: {
                senderWallet: address
            }
        },

        // 2️⃣ Sort
        {
            $sort: { createdAt: -1 }
        },

        // 3️⃣ Pagination
        { $skip: skip },
        { $limit: limit },

        // 4️⃣ Lookup user by wallet
        {
            $lookup: {
                from: 'users',
                localField: 'receiverWallet',
                foreignField: 'address',
                as: 'user'
            }
        },

        // 5️⃣ Flatten user array
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },

        // 6️⃣ Final projection (FLAT structure)
        {
            $project: {
                _id: 1,

                senderWallet: 1,
                receiverWallet: 1,

                amountUSD: 1,
                feeUSD: 1,
                totalTokenAmount: 1,
                tokenSymbol: 1,

                suiStats: {
                    suiPrice: 1,
                    suiHash: 1
                },

                wrapper: 1,
                message: 1,

                status: 1,
                verified: 1,
                openedAt: 1,

                // 🔥 flattened user fields
                username: '$user.username',
                avatar: '$user.avatar',

                createdAt: 1
            }
        }
    ]);

    const total = await Gift.countDocuments({ senderWallet: address });

    return { data, total };
};



export const getReceivedGifts = async (address: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const data = await Gift.aggregate([
        // 1️⃣ Match sender wallet
        {
            $match: {
                receiverWallet: address
            }
        },

        // 2️⃣ Sort
        {
            $sort: { createdAt: -1 }
        },

        // 3️⃣ Pagination
        { $skip: skip },
        { $limit: limit },

        // 4️⃣ Lookup user by wallet
        {
            $lookup: {
                from: 'users',
                localField: 'senderWallet',
                foreignField: 'address',
                as: 'user'
            }
        },

        // 5️⃣ Flatten user array
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },

        // 6️⃣ Final projection (FLAT structure)
        {
            $project: {
                _id: 1,

                senderWallet: 1,
                receiverWallet: 1,

                amountUSD: 1,
                feeUSD: 1,
                totalTokenAmount: 1,
                tokenSymbol: 1,

                suiStats: {
                    suiPrice: 1,
                    suiHash: 1
                },

                wrapper: 1,
                message: 1,

                status: 1,
                verified: 1,
                openedAt: 1,

                // 🔥 flattened user fields
                username: '$user.username',
                avatar: '$user.avatar',

                createdAt: 1
            }
        }
    ]);

    const total = await Gift.countDocuments({ receiverWallet: address });

    return { data, total };
};

export const getGiftById = async (giftId: string) => {
    const gift = await Gift.findById(giftId);

    if (!gift) return null;

    if (gift.isAnonymous) {
        // return without populating
        return gift.toObject();
    }

    // populate only if not anonymous
    return Gift.findById(giftId).populate('senderId', 'username avatar').lean();
};

export function hashTxBytes(bytes: Uint8Array): string {
    return createHash('sha256').update(bytes).digest('hex');
}


export const claimIntent = async (
    giftId: string,
    walletAddress: string
) => {
    const gift = await Gift.findOne({
        _id: giftId,
        status: 'sent',
    });

    if (!gift) {
        throw new Error('Gift not found or already claimed');
    }

    if (gift.receiverWallet !== walletAddress) {
        throw new Error('Not authorized to open this gift');
    }

    const tx = new Transaction();
    tx.setSender(walletAddress);
    tx.setGasBudget(5_000_000);

    const PACKAGE_ID = process.env.PACKAGE_ID!;
    const MODULE_NAME = process.env.MODULE_NAME!;

    tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::claim_gift`,
        arguments: [
            tx.object(gift.onChainGiftId),
            tx.pure.string(gift._id.toString()),
        ],
    });

    // 🔒 Deterministic build
    const txBytes = await tx.build({ client });

    // 🔐 Hash raw bytes (NOT base64)
    const txHash = hashTxBytes(txBytes);

    // Save intent hash
    await Gift.updateOne(
        { _id: giftId, status: 'sent' },
        { claimTxHash: txHash }
    );

    // Send BASE64 to frontend
    return {
        txBytes: Buffer.from(txBytes).toString('base64'),
    };
};



export const claimSubmit = async (
    giftId: string,
    txBytesBase64: string,
    signature: string,
    claimerAddress: string
) => {
    const gift = await Gift.findOne({
        _id: giftId,
        status: 'sent',
    });

    if (!gift) {
        throw new Error('Gift already claimed or invalid');
    }

    if (gift.receiverWallet !== claimerAddress) {
        throw new Error('Not authorized to open this gift');
    }

    console.log("Step 1 : Completed Receiver is Claimer Verification")

    // Decode base64 → Uint8Array
    const txBytes = Uint8Array.from(
        Buffer.from(txBytesBase64, 'base64')
    );

    console.log("Step 2 : Completed Transaction Bytes Decoding")

    // 🔐 Verify intent hash
    const receivedHash = hashTxBytes(txBytes);

    console.log("Step 3 : Completed Transaction Intent Hash Verification")

    if (receivedHash !== gift.claimTxHash) {
        throw new Error('Transaction intent mismatch');
    }

    console.log("Step 4 : Completed Transaction Intent Hash Verification")

    // Parse tx for validation
    const parsedTx = Transaction.from(txBytes);

    console.log("Step 5 : Completed Transaction Parsing")

    if (parsedTx.getData().sender !== gift.receiverWallet) {
        throw new Error('Invalid transaction sender');
    }

    console.log("Step 6 : Completed Transaction Sender Verification")

    // 🚀 Execute sponsored tx
    const result = await client.executeTransactionBlock({
        transactionBlock: txBytes,
        signature,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });

    console.log("Step 7 : Completed Transaction Execution")

    if (result.effects?.status.status !== 'success') {
        throw new Error('Transaction execution failed');
    }

    console.log(result.objectChanges)

    console.log("Step 8 : Completed Transaction Execution Verification")

    // 🔍 Verify gift object deletion
    const deleted = result.objectChanges?.some(
        (c: any) =>
            c.type === 'deleted' &&
            c.objectId === gift.onChainGiftId
    );

    console.log("Step 9 : Completed Gift Object Deletion Verification")

    if (!deleted) {
        throw new Error('Gift was not claimed on-chain');
    }

    console.log("Step 10 : Completed Gift Object Deletion Verification")

    // ✅ Final DB update (idempotent)
    await Gift.updateOne(
        { _id: giftId, status: 'sent' },
        {
            status: 'opened',
            openedAt: new Date(),
            deliveryTxDigest: result.digest,
        }
    );

    return {
        txDigest: result.digest,
    };
};

// Step 1 : Completed Receiver is Claimer Verification
// Step 2 : Completed Transaction Bytes Decoding
// Step 3 : Completed Transaction Intent Hash Verification
// Step 4 : Completed Transaction Intent Hash Verification
// Step 5 : Completed Transaction Parsing
// Step 6 : Completed Transaction Sender Verification
// Step 7 : Completed Transaction Execution
// Step 8 : Completed Transaction Execution Verification
// Step 9 : Completed Gift Object Deletion Verification
// Terminate batch job (Y/N)? Y

export const deleteUnverifiedGifts = async (userId: string) => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    await Gift.deleteMany({ createdAt: { $lt: tenMinutesAgo }, verified: false, senderId: userId });
};

export const resolveRecipients = async (usernames: string[]) => {
    // 1️⃣ Fetch all matching users
    const users = await User.find({
        username: { $in: usernames }
    }).select("username");

    // 2️⃣ Map for fast lookup
    const userMap = new Map(
        users.map(user => [user.username, user])
    );

    // 3️⃣ Detect missing usernames WITH POSITION
    const invalidUsernames: { username: string; index: number }[] = [];

    usernames.forEach((username, index) => {
        if (!userMap.has(username)) {
            invalidUsernames.push({ username, index });
        }
    });

    // 4️⃣ Throw error if any invalid
    if (invalidUsernames.length > 0) {
        const message = invalidUsernames
            .map(
                u => `Invalid username "${u.username}" at position ${u.index + 1}`
            )
            .join(", ");

        throw new Error(message);
    }

    // 5️⃣ Return users IN SAME ORDER as input
    return usernames.map(username => userMap.get(username)!);
};
