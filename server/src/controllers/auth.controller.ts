import { FastifyReply, FastifyRequest } from 'fastify';
import * as authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/responseHandler';
import { User } from '../models/user.model';
import { Address, getPublicKeyFromAddress } from '@solana/kit';
import { isValidSuiAddress } from '@mysten/sui/utils';

export const requestMessage = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { address, chain } = req.body as { address: string, chain: 'sol' | 'sui' };

        if (!address) {
            return errorResponse(reply, "Wallet address is required", 400);
        }

        //Validate Address by respective chain
        if (chain === 'sol') {
            const publicKey = await getPublicKeyFromAddress(address as Address);
            if (!publicKey) {
                return errorResponse(reply, "Invalid Solana address", 400);
            }
        } else if (chain === 'sui') {
            const publicKey = await isValidSuiAddress(address);
            if (!publicKey) {
                return errorResponse(reply, "Invalid Sui address", 400);
            }
        }

        const result = await authService.requestMessage(address, chain);

        return successResponse(reply, result, "Signing message generated", 200);
    } catch (error: any) {
        return errorResponse(reply, error.message, 400);
    }
};


export const verify = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const result = await authService.verify(req.body);

        // Set JWT token as HTTP-only cookie
        reply.setCookie("gc_token", result.token, {
            path: "/",
            httpOnly: true,
            secure: true,    // Use false for local development (HTTP), true in production (HTTPS)
            sameSite: "none", // Required for cross-origin requests with cookies
            maxAge: 21 * 24 * 60 * 60, // 25 days
        })

        successResponse(reply, { user: result.user }, 'User verified successfully', 200);
    } catch (error: any) {
        errorResponse(reply, error.message, 401);
    }
};

export const checkUsernameAvailability = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { username } = req.body as { username: string };

        if (username === 'admin' || username === 'profile') {
            return errorResponse(reply, "Username not available", 409)
        }

        // Set JWT token as HTTP-only cookie
        const user = await User.findOne({ usernameLower: username.toLowerCase() });

        if (user) {
            return errorResponse(reply, "Username already taken", 409)
        }

        successResponse(reply, { available: true }, 'Username available', 200);
    } catch (error: any) {
        errorResponse(reply, error.message, 401);
    }
};

export const disconnectWallet = async (req: FastifyRequest, reply: FastifyReply) => {
    try {

        // Set JWT token as HTTP-only cookie
        reply.setCookie("gc_token", null, {
            path: "/",
            httpOnly: true,
            secure: true,    // Use false for local development (HTTP), true in production (HTTPS)
            sameSite: "none", // Required for cross-origin requests with cookies
            maxAge: 21 * 24 * 60 * 60, // 25 days
        })

        successResponse(reply, {}, 'User disconnected successfully', 200);
    } catch (error: any) {
        errorResponse(reply, error.message, 401);
    }
};

export const me = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { address } = req.user!;
        const user = await User.findOne({ address })

        if (!user) {
            return errorResponse(reply, "User not found", 404);
        }

        successResponse(reply, { user }, 'User', 200);
    } catch (error: any) {
        errorResponse(reply, error.message, 401);
    }
};
