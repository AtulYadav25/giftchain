"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.requestMessage = void 0;
const user_model_1 = require("../models/user.model");
const jwt_1 = require("../utils/jwt");
const verify_1 = require("@mysten/sui/verify");
const crypto_1 = __importDefault(require("crypto"));
const requestMessage = async (address) => {
    // Generate a random 6-digit nonce
    const nonce = crypto_1.default.randomInt(100000, 999999);
    // Look for existing user
    let user = await user_model_1.User.findOne({ address });
    if (!user) {
        // Create new user with nonce
        user = await user_model_1.User.create({ address, nonce });
    }
    else {
        // Update nonce for existing user
        user.nonce = nonce;
        await user.save();
    }
    // Authentication message the user must sign
    const message = `Welcome to GiftChain!\nNonce: ${nonce}`;
    return {
        message,
        nonce,
        userId: user._id,
    };
};
exports.requestMessage = requestMessage;
const verify = async (data) => {
    const { address, message, signature, nonce, userId } = data;
    console.log(data);
    const user = await user_model_1.User.findOne({ address });
    if (!user)
        throw new Error('User not found');
    // Convert message to Uint8Array
    const messageBytes = new Uint8Array(message);
    // Verify signature
    let verifiedPublicKey;
    try {
        verifiedPublicKey = await (0, verify_1.verifyPersonalMessageSignature)(messageBytes, signature, {
            address: address,
        }); //Verify the Message is valid, also verifying the message is valid for given address
    }
    catch (error) {
        console.error("Signature verification error:", error.message);
        throw new Error(`Signature verification failed: ${error.message}`);
    }
    // ⏳ Token Expiry = 25 days
    const token = (0, jwt_1.signAccessToken)({ address, nonce, userId });
    return { user, token };
};
exports.verify = verify;
