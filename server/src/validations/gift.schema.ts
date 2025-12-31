import { z } from 'zod';

export const sendGiftSchema = z.object({
    receiverWallet: z.string(),
    senderWallet: z.string(),
    wrapper: z.string(),
    amountUSD: z.number(),
    feeUSD: z.number(),
    totalTokenAmount: z.string(),
    tokenStats: z.object({
        tokenPrice: z.number(),
        tokenHash: z.string(),
    }),
    tokenSymbol: z.enum(['sui', 'sol']),
    mediaType: z.enum(['image', 'video']),
    message: z.string().optional(),
    chain: z.enum(['sui', 'sol']),
    isAnonymous: z.boolean().optional(),
});

export type SendGiftBody = z.infer<typeof sendGiftSchema>;

export const verifyGiftSchema = z.object({
    giftId: z.string(), //GIFT Modal Mongoose ID
    address: z.string(),
    txDigest: z.string(),
    verifyType: z.enum(['wrapGift']),
});

export type VerifyGiftBody = z.infer<typeof verifyGiftSchema>;

export const openGiftSchema = z.object({
    giftId: z.string(),
});


export const resolveRecipientsSchema = z.object({
    usernames: z.array(z.string()),
});

export type ResolveRecipientsBody = z.infer<typeof resolveRecipientsSchema>;


// "GtvFV43P5gvPZh5L7gyVuhyMxrajZ63Rh5MyQiMiuaPm"