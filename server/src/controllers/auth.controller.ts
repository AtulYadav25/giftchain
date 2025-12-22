import { FastifyReply, FastifyRequest } from 'fastify';
import * as authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/responseHandler';
import { User } from '../models/user.model';

export const requestMessage = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { address } = req.body as { address: string };

        if (!address) {
            return errorResponse(reply, "Wallet address is required", 400);
        }

        const result = await authService.requestMessage(address);

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
