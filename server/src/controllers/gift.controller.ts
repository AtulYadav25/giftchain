import { FastifyReply, FastifyRequest } from 'fastify';
import * as giftService from '../services/gift.service';
import { successResponse, errorResponse, paginationResponse } from '../utils/responseHandler';
import SuiTransactionVerifier from '../utils/suiTxVerifier';
import { ResolveRecipientsBody, SendGiftBody, VerifyGiftBody } from '../validations/gift.schema';
import SolTransactionVerifier from '../utils/solanaTxVerifier';
import { Signature } from '@solana/kit';
import { Gift } from '../models/gift.model';
import jwt from 'jsonwebtoken';
import { truncateToTwoDecimals } from '../utils/jwt';
import { config } from '../config/env';


export const sendGift = async (req: FastifyRequest<{ Body: SendGiftBody }>, reply: FastifyReply) => {
    try {

        //Check if the receiver wallet is the fee collector wallet
        if (req.body.receiverWallet === config.SOL_FEE_COLLECTOR_ADDRESS || req.body.receiverWallet === config.SUI_FEE_COLLECTOR_ADDRESS) {
            return errorResponse(reply, "Invalid receiver wallet", 400);
        }

        const totalUnverifiedGifts = await Gift.countDocuments({ senderWallet: req.user!.address, verified: false });

        if (totalUnverifiedGifts >= 5) {
            return errorResponse(reply, "You have reached the limit of unverified gifts", 400);
        }


        //Verify with jwt for the tokenStats
        const tokenStats: any = await jwt.verify(req.body.tokenStats.tokenHash, process.env.JWT_SECRET!);
        if (!tokenStats) {
            return errorResponse(reply, "Invalid tokenStats", 400);
        }

        if (tokenStats.chain === req.user.chain && Number(req.body.totalTokenAmount) !== (truncateToTwoDecimals(req.body.amountUSD) / tokenStats.priceUSD)) {
            return errorResponse(reply, "Not Authenticated Transaction!", 400);
        }

        const gift = await giftService.createGift(req.user!.userId, req.body, req.user.chain, req.user.address);


        //Delete Gifts that are older then 10 Minutes and their tx is not verified
        // await giftService.deleteUnverifiedGifts(req.user!.userId);

        successResponse(reply, gift, "Gift created successfully", 201);
    } catch (error: any) {
        errorResponse(reply, "Something went wrong", 500);
    }
};


export const verifyGift = async (req: FastifyRequest<{ Body: VerifyGiftBody }>, reply: FastifyReply) => {
    try {

        //Check if the gift is already verified
        const gift = await Gift.findById(req.body.giftId);
        if (gift?.verified) {
            return errorResponse(reply, "Gift is already verified", 400);
        }


        if (req.user.chain === 'sol') {
            const solTxVerifier = new SolTransactionVerifier();
            const txResult: any = await solTxVerifier.verifyTransaction(req.body.txDigest as Signature, { walletAddress: req.body.address.trim() });

            if (txResult.status && txResult.giftIds.includes(req.body.giftId)) {

                await giftService.verifySOLGifts({
                    giftIds: txResult.giftIds,
                    sender: req.body.address.trim(),
                });

                successResponse(reply, txResult, "Gift verified successfully", 201);
            } else {
                errorResponse(reply, txResult.message || "Transaction verification failed", 400);
            }

        } else if (req.user.chain === 'sui') {

            // Verify the transaction on Sui blockchain
            const txVerifier = new SuiTransactionVerifier();
            const txResult: any = await txVerifier.verifyTransaction(req.body.txDigest, { walletAddress: req.body.address.trim(), giftId: req.body.giftId });

            // Filter GiftWrapped events and extract gift_db_id
            const giftObjs: any[] = txResult.events
                .filter((event: any) =>
                    event.type?.includes("::gift::GiftSent")
                )
                .map((event: any) => event.parsedJson)
                .filter(Boolean); // removes undefined/null


            //Get Gift IDs from the Event and update the Mongodb Documents of Gifts to verified true;
            if (txResult.verified) {
                await giftService.verifySUIGifts(giftObjs, req.body.address.trim());
            } else {
                errorResponse(reply, "Transaction is not verified", 400);
            }

            successResponse(reply, txResult, "Gift verified successfully", 201);
        }

    } catch (error: any) {
        errorResponse(reply, error.message, 500);
    }
};

export const getSent = async (req: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
    try {
        const query = req.query as { page?: string; limit?: string };
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const { data } = await giftService.getSentGifts(
            req.params.address,
            page,
            limit
        );

        return paginationResponse(reply, data, 100, page, limit, 200);

    } catch (error: any) {
        return errorResponse(reply, "Something went wrong", 500);
    }
};

export const getMyGifts = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const query = req.query as { page?: string; limit?: string };
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const { data } = await giftService.getSentGifts(
            req.user.address,
            page,
            limit,
            true
        );

        return paginationResponse(reply, data, 100, page, limit, 200);

    } catch (error: any) {
        return errorResponse(reply, "Something went wrong", 500);
    }
};


export const getReceived = async (req: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply) => {
    try {
        const query = req.query as { page?: string; limit?: string };
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        const { data } = await giftService.getReceivedGifts(
            req.params.address,
            page,
            limit
        );

        return paginationResponse(reply, data, 100, page, limit, 200);

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

export const claimGift = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        await giftService.claimGift(req.params.id, req.user.address);

        successResponse(reply, {}, "Gift opened successfully", 200);
    } catch (error: any) {
        errorResponse(reply, error.message, 500);
    }
};

export const resolveRecipients = async (
    req: FastifyRequest<{ Body: ResolveRecipientsBody }>,
    reply: FastifyReply
) => {
    try {
        const { usernames } = req.body;

        const users = await giftService.resolveRecipients(usernames, req.user.chain);

        successResponse(reply, users, "Recipients resolved successfully", 200);
    } catch (error) {
        errorResponse(reply, error.message, 500);
    }
};
