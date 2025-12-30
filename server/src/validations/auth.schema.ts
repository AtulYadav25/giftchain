import { z } from 'zod';

export const requestMessageSchema = z.object({
    address: z.string().min(3),
    chain: z.string(),
});

export const verifySchema = z.object({
    address: z.string().min(2),
    message: z.array(z.number()),
    nonce: z.number().min(2),
    userId: z.string().min(2),
    signature: z.string().min(2),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string(),
});
