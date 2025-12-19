import { FastifyReply, FastifyRequest } from 'fastify';
import * as giftService from '../services/gift.service';
import { successResponse, errorResponse, paginationResponse } from '../utils/responseHandler';
import SuiTransactionVerifier from '../utils/suiTxVerifier';
import { VerifyGiftBody } from '../validations/gift.schema';


export const sendGift = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log("Creating GIFT")
        const gift = await giftService.createGift(req.user!.userId, req.body);

        //TODO: Verify Gift Sent Transaction by SUI Indexer

        //Delete Gifts that are older then 10 Minutes and their tx is not verified
        await giftService.deleteUnverifiedGifts(req.user!.userId);

        successResponse(reply, gift, "Gift created successfully", 201);
    } catch (error: any) {
        errorResponse(reply, "Something went wrong", 500);
    }
};


export const verifyGift = async (req: FastifyRequest<{ Body: VerifyGiftBody }>, reply: FastifyReply) => {
    try {

        // Verify the transaction on Sui blockchain
        const txVerifier = new SuiTransactionVerifier();
        const txResult: any = await txVerifier.verifyTransaction(req.body.txDigest, { walletAddress: req.body.address.trim(), giftDbId: req.body.giftId, verifyType: req.body.verifyType });

        // Filter GiftWrapped events and extract gift_db_id
        const giftIds: string[] = txResult.events
            .filter((event: any) =>
                event.type?.includes("::gift::GiftWrapped")
            )
            .map((event: any) => event.parsedJson?.gift_db_id)
            .filter(Boolean); // removes undefined/null

        //Get Gift IDs from the Event and update the Mongodb Documents of Gifts to verified true;
        if (txResult.verified) {
            await giftService.verifyGifts(giftIds);
        }

        successResponse(reply, txResult, "Gift verified successfully", 201);
    } catch (error: any) {
        errorResponse(reply, "Something went wrong", 500);
    }
};

export const getSent = async (req: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
    try {
        const query = req.query as { page?: string; limit?: string };
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        console.log("Address", req.params.address);

        const { data, total } = await giftService.getSentGifts(
            req.params.address,
            page,
            limit
        );

        console.log("Data", data);
        console.log("Total", total);
        return paginationResponse(reply, data, total, page, limit, 200);

    } catch (error: any) {
        return errorResponse(reply, "Something went wrong", 500);
    }
};


export const getReceived = async (req: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
    try {
        const query = req.query as { page?: string; limit?: string };
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const { data, total } = await giftService.getReceivedGifts(
            req.params.address,
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
