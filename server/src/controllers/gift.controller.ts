import { FastifyReply, FastifyRequest } from 'fastify';
import * as giftService from '../services/gift.service';

export const sendGift = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const gift = await giftService.createGift(req.user.userId, req.body);
        reply.code(201).send(gift);
    } catch (error: any) {
        reply.code(500).send({ message: error.message });
    }
};

export const getSent = async (req: FastifyRequest, reply: FastifyReply) => {
    const gifts = await giftService.getSentGifts(req.user.userId);
    reply.send(gifts);
};

export const getReceived = async (req: FastifyRequest, reply: FastifyReply) => {
    const gifts = await giftService.getReceivedGifts(req.user.userId);
    reply.send(gifts);
};

export const getOne = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const gift = await giftService.getGiftById(req.params.id);
    if (!gift) return reply.code(404).send({ message: 'Gift not found' });
    reply.send(gift);
};

export const openGift = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const gift = await giftService.openGift(req.params.id, req.user.userId);
        reply.send(gift);
    } catch (error: any) {
        reply.code(400).send({ message: error.message });
    }
};
