import { Gift } from '../models/gift.model';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Transaction } from '@mysten/sui/transactions';
import { getClient } from '../utils/sui';
import { createHash } from 'crypto';
import { extractImagePublicId } from '../utils/imageHelper';
import { truncateToTwoDecimals } from '../utils/jwt';

const client = getClient('testnet');

export const createGift = async (senderId: string, data: any, chain: string, senderWallet: string) => {
    const gift = await Gift.create({
        senderId,
        senderWallet,
        receiverWallet: data.receiverWallet,

        amountUSD: truncateToTwoDecimals(data.amountUSD), // In USD eg: 100 USD
        totalTokenAmount: Number(data.totalTokenAmount), // In SUI(MIST) eg: 1.154 SUI but stored 11545558885
        tokenSymbol: data.tokenSymbol, // 'sui' | 'sol'
        feeUSD: data.feeUSD, // In USD eg: 1 USD
        tokenStats: data.tokenStats,

        wrapper: extractImagePublicId(data.wrapper),
        message: data.message,
        mediaType: data.mediaType,

        status: 'unverified',
        verified: false,

        senderTxHash: null,

        chain, // 'sui' | 'sol' 
        isAnonymous: false
    });

    return gift;
};
type GiftObj = {
    gift_db_id: string;
    gift_obj_id: string;
    amount: number;
};

export const verifySOLGifts = async ({
    giftIds,
    sender,
}: {
    giftIds: string[];
    sender: string;
}) => {
    const gifts = await Gift.find(
        {
            _id: { $in: giftIds },
            senderWallet: sender,
            verified: { $ne: true },
        },
        { _id: 1, amountUSD: 1, receiverWallet: 1 }
    );


    if (gifts.length !== giftIds.length) {
        throw new Error('Invalid or already verified gift');
    }

    await Gift.updateMany(
        { _id: { $in: giftIds } },
        {
            $set: {
                verified: true,
                status: 'sent',
            },
        }
    );

    const totalUSD = gifts.reduce(
        (acc, gift) => acc + (Number(gift.amountUSD) || 0),
        0
    );

    //Update the totalSentUSD of senderWallet to +amount of this gift
    await User.updateOne(
        { address: sender },
        { $inc: { totalSentUSD: totalUSD, sentCount: gifts.length } }
    );

    const receiverTotals = new Map<string, number>();

    for (const gift of gifts) {
        if (!gift.receiverWallet) continue;
        receiverTotals.set(
            gift.receiverWallet,
            (receiverTotals.get(gift.receiverWallet) || 0) + Number(gift.amountUSD || 0)
        );
    }

    const receiverUpdates = Array.from(receiverTotals.entries()).map(
        ([wallet, amount]) =>
            User.updateOne(
                { address: wallet },
                {
                    $inc: {
                        totalReceivedUSD: amount,
                        receivedCount: 1,
                    },
                }
            )
    );

    await Promise.all(receiverUpdates);



};


export const verifySUIGifts = async (giftObjs: GiftObj[], sender: string) => {
    const giftIds = giftObjs.map(g => g.gift_db_id.toString());

    // Lookup maps (MIST everywhere)
    const amountMap = new Map(
        giftObjs.map(g => [g.gift_db_id.toString(), Number(g.amount)])
    );

    // Fetch only what we need
    const gifts = await Gift.find(
        { _id: { $in: giftIds } },
        { totalTokenAmount: 1, amountUSD: 1 }
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
                        verified: true
                    },
                },
            },
        }))
    );

    //Update the totalSentUSD of senderWallet to +amount of this gift
    const totalUSD = gifts.reduce(
        (acc, gift) => acc + (Number(gift.amountUSD) || 0),
        0
    );

    //Update the totalSentUSD of senderWallet to +amount of this gift
    await User.updateOne(
        { address: sender },
        { $inc: { totalSentUSD: totalUSD, sentCount: gifts.length } }
    );

    const receiverTotals = new Map<string, number>();

    for (const gift of gifts) {
        if (!gift.receiverWallet) continue;
        receiverTotals.set(
            gift.receiverWallet,
            (receiverTotals.get(gift.receiverWallet) || 0) + Number(gift.amountUSD || 0)
        );
    }

    const receiverUpdates = Array.from(receiverTotals.entries()).map(
        ([wallet, amount]) =>
            User.updateOne(
                { address: wallet },
                {
                    $inc: {
                        totalReceivedUSD: amount,
                        receivedCount: 1,
                    },
                }
            )
    );

    await Promise.all(receiverUpdates);
};



export const getSentGifts = async (
    address: string,
    page = 1,
    limit = 10,
    isAuthenticated = false
) => {
    const skip = (page - 1) * limit;

    const data = await Gift.aggregate([
        // 1️⃣ Match sender wallet
        {
            $match: {
                senderWallet: address,
                ...(!isAuthenticated ? { verified: true } : {})
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

                tokenStats: {
                    tokenPrice: 1,
                    tokenHash: 1
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

    return { data };
};



export const getReceivedGifts = async (address: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const data = await Gift.aggregate([
        // 1️⃣ Match sender wallet
        {
            $match: {
                receiverWallet: address,
                verified: true
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

                tokenStats: {
                    tokenPrice: 1,
                    tokenHash: 1
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

    return { data };
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


export const claimGift = async (
    giftId: string,
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

    // ✅ Final DB update (idempotent)
    await Gift.updateOne(
        { _id: giftId, status: 'sent' },
        {
            status: 'opened',
            openedAt: new Date(),
        }
    );

    return true //isClaimed: True

};

export const deleteUnverifiedGifts = async (userId: string) => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    await Gift.deleteMany({ createdAt: { $lt: tenMinutesAgo }, verified: false, senderId: userId });
};

export const resolveRecipients = async (usernames: string[], chain: string) => {
    // 1️⃣ Fetch all matching users
    const users = await User.find({
        username: { $in: usernames },
        chain,
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
