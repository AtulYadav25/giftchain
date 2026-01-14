import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGO_URI: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    NODE_ENV: z.string().min(1),
    COOKIE_SECRET: z.string().min(1),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    CMC_API_KEY: z.string().min(1), //Coin Market Cap Crypto Coin Price Fetching API
    REDIS_URL: z.string().min(1), //Redis to cache Crypto Coin Price
    SOL_FEE_COLLECTOR_ADDRESS: z.string(),
    SUI_FEE_COLLECTOR_ADDRESS: z.string(),
    SOLANA_NETWORK: z.string().default('testnet'),
    SUI_NETWORK: z.string().default('testnet'),
    CLOUD_NAME: z.string().min(1),
    IMAGE_HOST: z.string().min(1),

    PACKAGE_ID: z.string().min(1),
    MODULE_NAME: z.string().min(1),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1);
}

export const config = _env.data;
