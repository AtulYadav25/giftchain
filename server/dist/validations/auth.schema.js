"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.verifySchema = exports.requestMessageSchema = void 0;
const zod_1 = require("zod");
exports.requestMessageSchema = zod_1.z.object({
    address: zod_1.z.string().min(3)
});
exports.verifySchema = zod_1.z.object({
    address: zod_1.z.string().min(2),
    message: zod_1.z.array(zod_1.z.number()),
    nonce: zod_1.z.number().min(2),
    userId: zod_1.z.string().min(2),
    signature: zod_1.z.string().min(2),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string(),
});
