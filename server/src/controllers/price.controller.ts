import { FastifyReply, FastifyRequest } from 'fastify';
import { getSuiPrice } from '../services/price.service';
import { errorResponse, successResponse } from '../utils/responseHandler';
import jwt from 'jsonwebtoken';

export const getPrice = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const price = await getSuiPrice();

        const suiHash = jwt.sign({ priceUSD: price, timestamp: Date.now() }, process.env.JWT_SECRET!);

        successResponse(reply, { priceUSD: price, suiHash }, "Price fetched successfully", 200);
    } catch (error) {
        console.error('Price fetch error:', error);
        errorResponse(reply, 'Failed to retrieve SUI price', 500);
    }
};
