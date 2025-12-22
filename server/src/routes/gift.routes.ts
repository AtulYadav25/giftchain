import { FastifyInstance } from 'fastify';
import * as giftController from '../controllers/gift.controller';
import { claimSubmitSchema, resolveRecipientsSchema, sendGiftSchema, verifyGiftSchema } from '../validations/gift.schema';
import { authenticate } from '../middlewares/auth';

export const giftRoutes = async (app: FastifyInstance) => {
    app.get('/sent/:address', giftController.getSent);
    app.get('/received/:address', giftController.getReceived);
    app.get('/:id', giftController.getOne);

    app.addHook('preHandler', authenticate);
    app.post('/send', { schema: { body: sendGiftSchema } }, giftController.sendGift);
    app.post('/verify', { schema: { body: verifyGiftSchema } }, giftController.verifyGift);
    app.post('/claim-intent/:id', giftController.claimIntent);
    app.post('/claim-submit/:id', { schema: { body: claimSubmitSchema } }, giftController.claimSubmit);
    app.post('/recipients/resolve', { schema: { body: resolveRecipientsSchema } }, giftController.resolveRecipients);
};