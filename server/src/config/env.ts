import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGO_URI: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    SUI_PRIVATE_KEY: z.string().optional(),
    IKA_PRIVATE_KEY: z.string().optional(),
    SOLANA_RPC_URL: z.string().default('https://api.devnet.solana.com'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1);
}

export const config = _env.data;
