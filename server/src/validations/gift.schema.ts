import { z } from 'zod';

export const sendGiftSchema = z.object({
    receiverWallet: z.string(),
    senderWallet: z.string(),
    wrapper: z.string(),
    amountUSD: z.number(),
    feeUSD: z.number(),
    totalTokenAmount: z.string(),
    suiStats: z.object({
        suiPrice: z.number(),
        suiHash: z.string(),
    }),
    tokenSymbol: z.enum(['sui']),
    message: z.string().optional(),
    chainId: z.enum(['sui']),
    isAnonymous: z.boolean().optional(),
});

export const verifyGiftSchema = z.object({
    giftId: z.string(),
    address: z.string(),
    txDigest: z.string(),
    verifyType: z.enum(['wrapGift', 'claimGift']),
});

export type VerifyGiftBody = z.infer<typeof verifyGiftSchema>;

export const openGiftSchema = z.object({
    giftId: z.string(),
});


export const resolveRecipientsSchema = z.object({
    usernames: z.array(z.string()),
});

export type ResolveRecipientsBody = z.infer<typeof resolveRecipientsSchema>;


export const claimSubmitSchema = z.object({
    txBytes: z.string(),
    signature: z.string(),
});

export type ClaimSubmitBody = z.infer<typeof claimSubmitSchema>;
// "GtvFV43P5gvPZh5L7gyVuhyMxrajZ63Rh5MyQiMiuaPm"