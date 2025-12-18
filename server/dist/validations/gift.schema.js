"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openGiftSchema = exports.sendGiftSchema = void 0;
const zod_1 = require("zod");
exports.sendGiftSchema = zod_1.z.object({
    receiverWallet: zod_1.z.string(),
    senderWallet: zod_1.z.string(),
    wrapperId: zod_1.z.string(),
    message: zod_1.z.string().optional(),
    chainId: zod_1.z.enum(['sui']),
    amount: zod_1.z.number(), // For logic handling
});
exports.openGiftSchema = zod_1.z.object({
    giftId: zod_1.z.string(),
});
