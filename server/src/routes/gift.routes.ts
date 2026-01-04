import { FastifyInstance } from 'fastify';
import * as giftController from '../controllers/gift.controller';
import { resolveRecipientsSchema, sendGiftSchema, verifyGiftSchema } from '../validations/gift.schema';
import { authenticate } from '../middlewares/auth';

export const giftRoutes = async (app: FastifyInstance) => {

    // 🌐 PUBLIC
    app.get('/stats', giftController.getTotalGiftSent);
    app.get('/sent/:address', giftController.getSent);
    app.get('/received/:address', giftController.getReceived);
    app.get('/:id', giftController.getOne);

    // 🔒 PRIVATE
    app.register(async (protectedApp) => {
        protectedApp.addHook('preHandler', authenticate);

        protectedApp.get('/me/sent', giftController.getMyGifts);
        protectedApp.post('/send', { schema: { body: sendGiftSchema } }, giftController.sendGift);
        protectedApp.post('/verify', { schema: { body: verifyGiftSchema } }, giftController.verifyGift);
        protectedApp.get('/claim-gift/:id', giftController.claimGift);
        protectedApp.get('/delete-unverified/:giftId', giftController.deleteUnverifiedGifts);
        protectedApp.post('/recipients/resolve', { schema: { body: resolveRecipientsSchema } }, giftController.resolveRecipients);
    });
};
