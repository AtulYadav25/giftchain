import { FastifyReply, FastifyRequest } from 'fastify';
import { getSuiPrice, getSolPrice } from '../services/price.service';
import { errorResponse, successResponse } from '../utils/responseHandler';
import jwt from 'jsonwebtoken';

export const getSUI = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const price = await getSuiPrice();

        const tokenHash = jwt.sign({ priceUSD: price, timestamp: Date.now(), chain: req.user.chain }, process.env.JWT_SECRET!);

        successResponse(reply, { priceUSD: price, tokenHash }, "Price fetched successfully", 200);
    } catch (error) {
        console.error('Price fetch error:', error);
        errorResponse(reply, 'Failed to retrieve SUI price', 500);
    }
};

export const getSOL = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const price = await getSolPrice();

        const tokenHash = jwt.sign({ priceUSD: price, timestamp: Date.now(), chain: req.user.chain }, process.env.JWT_SECRET!);

        successResponse(reply, { priceUSD: price, tokenHash }, "Price fetched successfully", 200);
    } catch (error) {
        console.error('Price fetch error:', error);
        errorResponse(reply, 'Failed to retrieve SUI price', 500);
    }
};