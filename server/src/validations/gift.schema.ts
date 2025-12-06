import { z } from 'zod';

export const sendGiftSchema = z.object({
    receiverId: z.string().optional(), // MongoDB ID
    receiverWallet: z.string().optional(),
    wrapperId: z.string(),
    message: z.string().optional(),
    chainId: z.enum(['sui', 'solana']).optional(),
    amount: z.number().optional(), // For logic handling
});

export const openGiftSchema = z.object({
    giftId: z.string(),
});
