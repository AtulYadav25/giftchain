import { FastifyInstance } from 'fastify';
import * as giftController from '../controllers/gift.controller';
import { sendGiftSchema } from '../validations/gift.schema';
import { authenticate } from '../middlewares/auth';

export const giftRoutes = async (app: FastifyInstance) => {
    app.get('/sent/:username', giftController.getSent);
    app.get('/received/:username', giftController.getReceived);

    app.addHook('preHandler', authenticate);
    app.post('/send', { schema: { body: sendGiftSchema } }, giftController.sendGift);
    app.get('/:id', giftController.getOne);
    app.post('/open/:id', giftController.openGift);
};
