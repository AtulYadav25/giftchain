import { Gift } from '../models/gift.model';
import { User } from '../models/user.model';
import { getClient } from '../utils/sui';
import { createHash } from 'crypto';
import { extractImagePublicId } from '../utils/imageHelper';

const client = getClient();

export const createGift = async (senderId: string, data: any, chain: string, senderWallet: string) => {
    const gift = await Gift.create({
        senderId,
        senderWallet,
        receiverWallet: data.receiverWallet,

        amountUSD: data.amountUSD, // In USD eg: 100 USD
        totalTokenAmount: Number(data.totalTokenAmount), // In SUI(MIST) eg: 1.154 SUI but stored 11545558885
        tokenSymbol: data.tokenSymbol, // 'sui' | 'sol'
        feeUSD: data.feeUSD, // In USD eg: 1 USD
        tokenStats: data.tokenStats,

        isMessagePrivate: data.isMessagePrivate,

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
    digest
}: {
    giftIds: string[];
    sender: string;
    digest: string;
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
                senderTxHash: digest
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


export const verifySUIGifts = async (giftObjs: GiftObj[], sender: string, digest: string) => {
    const giftIds = giftObjs.map(g => g.gift_db_id.toString());

    // Lookup maps (MIST everywhere)
    const amountMap = new Map(
        giftObjs.map(g => [g.gift_db_id.toString(), Number(g.amount)])
    );

    // Fetch only what we need
    const gifts = await Gift.find(
        { _id: { $in: giftIds }, verified: { $ne: true } },
        { totalTokenAmount: 1, amountUSD: 1, receiverWallet: 1 }
    ).lean();

    // 1️⃣ Ensure all gifts exist
    if (gifts.length !== giftObjs.length) {
        throw new Error('Gift count mismatch');
    }

    // 2️⃣ Verify amounts (MIST → MIST)
    const isVerified = gifts.every(gift => {
        const expectedAmount = amountMap.get(gift._id.toString());
        if (expectedAmount == null) return false;

        return BigInt(gift.totalTokenAmount) === BigInt(expectedAmount);
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
                        senderTxHash: digest
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

    let unverified: any[] = [];

    // 1️⃣ If authenticated + page = 1 → pull unverified gifts first
    if (isAuthenticated && page === 1) {
        unverified = await Gift.aggregate([
            {
                $match: {
                    senderWallet: address,
                    verified: false
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'receiverWallet',
                    foreignField: 'address',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    senderWallet: 1,
                    receiverWallet: 1,
                    amountUSD: 1,
                    feeUSD: 1,
                    totalTokenAmount: 1,
                    tokenSymbol: 1,
                    isMessagePrivate: 1,
                    tokenStats: {
                        tokenPrice: 1,
                        tokenHash: 1
                    },
                    wrapper: 1,
                    message: 1,
                    status: 1,
                    verified: 1,
                    openedAt: 1,
                    username: '$user.username',
                    avatar: '$user.avatar',
                    createdAt: 1
                }
            }
        ]);
    }

    // 2️⃣ Now fetch normal paginated SENT gifts
    const paginated = await Gift.aggregate([
        {
            $match: {
                senderWallet: address,
                ...(!isAuthenticated ? { verified: true } : {})
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: 'receiverWallet',
                foreignField: 'address',
                as: 'user'
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                senderWallet: 1,
                receiverWallet: 1,
                amountUSD: 1,
                feeUSD: 1,
                totalTokenAmount: 1,
                tokenSymbol: 1,
                isMessagePrivate: 1,
                tokenStats: {
                    tokenPrice: 1,
                    tokenHash: 1
                },
                wrapper: 1,
                message: {
                    $cond: [
                        {
                            $or: [
                                { $eq: ['$isMessagePrivate', false] },
                                isAuthenticated
                            ]
                        },
                        '$message',
                        null
                    ]
                },
                status: 1,
                verified: 1,
                openedAt: 1,
                username: '$user.username',
                avatar: '$user.avatar',
                createdAt: 1
            }
        }
    ]);

    // 3️⃣ Merge cleanly without duplicates
    const merged = [
        ...unverified,
        ...paginated.filter(g => !unverified.find(u => u._id.toString() === g._id.toString()))
    ];

    return { data: merged };
};



export const getReceivedGifts = async (
    address: string,
    page = 1,
    limit = 10,
    authenticated = false
) => {
    const skip = (page - 1) * limit;

    const data = await Gift.aggregate([
        {
            $match: {
                receiverWallet: address,
                verified: true
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: 'senderWallet',
                foreignField: 'address',
                as: 'user'
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,

                senderWallet: 1,
                receiverWallet: 1,

                amountUSD: 1,
                feeUSD: 1,
                totalTokenAmount: 1,
                tokenSymbol: 1,

                isMessagePrivate: 1,

                tokenStats: {
                    tokenPrice: 1,
                    tokenHash: 1
                },

                wrapper: 1,

                // 🔥 CONDITIONAL MESSAGE LOGIC
                message: {
                    $cond: [
                        {
                            $or: [
                                { $eq: ['$isMessagePrivate', false] },
                                authenticated
                            ]
                        },
                        '$message',
                        null
                    ]
                },

                status: 1,
                verified: 1,
                openedAt: 1,

                username: '$user.username',
                avatar: '$user.avatar',

                createdAt: 1
            }
        }
    ]);

    return { data };
};


export const getGiftById = async (giftId: string, address: string | null) => {
    const gift = await Gift.findById(giftId).populate('senderId', 'username avatar').lean();
    if (!gift) return null;

    const isOwner =
        gift.senderWallet?.toLowerCase() === address?.toLowerCase() ||
        gift.receiverWallet?.toLowerCase() === address?.toLowerCase();

    // If the viewer is the sender or receiver → always return full gift including message
    if (isOwner) {
        return gift;
    }

    // If viewer is not sender or receiver → respect private message rules
    if (gift.isMessagePrivate) {
        // Remove message for outsiders
        delete gift.message;
    }

    return gift;
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

export const deleteUnverifiedGift = async (giftId: string, userAddress: string) => {
    const gift = await Gift.findById(giftId);

    if (!gift || gift.verified || gift.senderWallet !== userAddress) {
        throw new Error('Gift Not Valid')
    };

    await gift.deleteOne();
};

export const resolveRecipients = async (
    usernames: string[],
    chain?: string
) => {
    if (usernames.length > 15) {
        throw new Error("Too many recipients (max: 15)");
    }

    // normalize once
    const normalized = usernames.map(u => u.toLowerCase());

    // DB query
    const query: Record<string, any> = {
        usernameLower: { $in: [...new Set(normalized)] },
    };
    if (chain) query.chain = chain;

    const users = await User.find(query).select("username address");

    // map for quick lookup
    const userMap = new Map<string, string>(
        users.map(user => [user.username.toLowerCase(), user.address])
    );

    // detect invalid + build resolved in correct order
    const invalidUsernames: { username: string; index: number }[] = [];
    const resolved: { username: string; address: string }[] = [];

    usernames.forEach((username, index) => {
        const addr = userMap.get(username.toLowerCase());

        if (addr) {
            resolved.push({ username, address: addr });
        } else {
            invalidUsernames.push({ username, index });
        }
    });

    return { resolved, invalidUsernames };
};
