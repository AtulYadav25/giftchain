"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.verify = exports.requestMessage = void 0;
const authService = __importStar(require("../services/auth.service"));
const responseHandler_1 = require("../utils/responseHandler");
const user_model_1 = require("../models/user.model");
const requestMessage = async (req, reply) => {
    try {
        const { address } = req.body;
        if (!address) {
            return (0, responseHandler_1.errorResponse)(reply, "Wallet address is required", 400);
        }
        const result = await authService.requestMessage(address);
        return (0, responseHandler_1.successResponse)(reply, result, "Signing message generated", 200);
    }
    catch (error) {
        return (0, responseHandler_1.errorResponse)(reply, error.message, 400);
    }
};
exports.requestMessage = requestMessage;
const verify = async (req, reply) => {
    try {
        const result = await authService.verify(req.body);
        // Set JWT token as HTTP-only cookie
        reply.setCookie("gc_token", result.token, {
            path: "/",
            httpOnly: true,
            secure: true, // Use false for local development (HTTP), true in production (HTTPS)
            sameSite: "none", // Required for cross-origin requests with cookies
            maxAge: 21 * 24 * 60 * 60, // 25 days
        });
        (0, responseHandler_1.successResponse)(reply, { user: result.user }, 'User verified successfully', 200);
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(reply, error.message, 401);
    }
};
exports.verify = verify;
const me = async (req, reply) => {
    try {
        const { address } = req.user;
        const user = await user_model_1.User.findOne({ address });
        if (!user) {
            return (0, responseHandler_1.errorResponse)(reply, "User not found", 404);
        }
        (0, responseHandler_1.successResponse)(reply, { user }, 'User', 200);
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(reply, error.message, 401);
    }
};
exports.me = me;
