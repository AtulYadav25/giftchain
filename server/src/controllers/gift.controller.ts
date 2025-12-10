import { FastifyReply, FastifyRequest } from 'fastify';
import * as giftService from '../services/gift.service';
import { successResponse, errorResponse, paginationResponse } from '../utils/responseHandler';

export const sendGift = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const gift = await giftService.createGift(req.user!.userId, req.body);
        //TODO: Verify Gift Sent Transaction

        successResponse(reply, gift, "Gift created successfully", 201);
    } catch (error: any) {
        errorResponse(reply, "Something went wrong", 500);
    }
};

export const getSent = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = req.query as { page?: string; limit?: string };
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const { data, total } = await giftService.getSentGifts(
            req.user!.userId,
            page,
            limit
        );

        return paginationResponse(reply, data, total, page, limit, 200);

    } catch (error: any) {
        return errorResponse(reply, "Something went wrong", 500);
    }
};


export const getReceived = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = req.query as { page?: string; limit?: string };
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const { data, total } = await giftService.getReceivedGifts(
            req.user!.userId,
            page,
            limit
        );

        return paginationResponse(reply, data, total, page, limit, 200);

    } catch (error: any) {
        return errorResponse(reply, "Something went wrong", 500);
    }
};


export const getOne = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const gift = await giftService.getGiftById(req.params.id);
        successResponse(reply, gift, "Gift fetched successfully", 200);
    } catch (error: any) {
        errorResponse(reply, "Something went wrong", 500);
    }
};

export const openGift = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const gift = await giftService.openGift(req.params.id, req.user!.userId);
        successResponse(reply, gift, "Gift opened successfully", 200);
    } catch (error: any) {
        errorResponse(reply, "Something went wrong", 500);
    }
};
