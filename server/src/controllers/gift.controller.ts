import { FastifyReply, FastifyRequest } from 'fastify';
import * as giftService from '../services/gift.service';
import { successResponse, errorResponse, paginationResponse } from '../utils/responseHandler';
import SuiTransactionVerifier from '../utils/suiTxVerifier';
import { ResolveRecipientsBody, VerifyGiftBody } from '../validations/gift.schema';
import SolTransactionVerifier from '../utils/solanaTxVerifier';
import { Signature } from '@solana/kit';
import { Gift } from '../models/gift.model';


export const sendGift = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        //TODO : Reject Gift Creation If User has > 5 Unverified Gifts, Make user delete it to continue creating Gifts
        const gift = await giftService.createGift(req.user!.userId, req.body, req.user.chain);


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


        //TODO : Also Verify that the totalTokenAmount === the Transaction tokens amount 
        //NOTE : Verify with the tokenStats for comparing the totalTokenAmount and transaction value
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

            //TODO: Deploy a new Smart contract where the SUI Coins are sent directly to  the receiver instead of wrapping it in Object

            // Filter GiftWrapped events and extract gift_db_id
            const giftObjs: any[] = txResult.events
                .filter((event: any) =>
                    event.type?.includes("::gift::GiftSent")
                )
                .map((event: any) => event.parsedJson)
                .filter(Boolean); // removes undefined/null


            //Get Gift IDs from the Event and update the Mongodb Documents of Gifts to verified true;
            if (txResult.verified) {
                await giftService.verifySUIGifts(giftObjs);
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

        const { data, total } = await giftService.getSentGifts(
            req.params.address,
            page,
            limit
        );

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
