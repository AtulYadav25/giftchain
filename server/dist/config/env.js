"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    MONGO_URI: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    SUI_PRIVATE_KEY: zod_1.z.string().optional(),
    COOKIE_SECRET: zod_1.z.string().min(1),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1),
    CMC_API_KEY: zod_1.z.string().min(1),
    KV_REST_API_URL: zod_1.z.string().optional(),
    KV_REST_API_TOKEN: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().min(1),
    SOLANA_RPC_URL: zod_1.z.string().default('https://api.devnet.solana.com'),
    IKA_PRIVATE_KEY: zod_1.z.string().optional()
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1);
}
exports.config = _env.data;
