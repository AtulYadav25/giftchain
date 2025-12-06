import { FastifyInstance } from 'fastify';
import * as giftController from '../controllers/gift.controller';
import { sendGiftSchema } from '../validations/gift.schema';
import { authenticate } from '../middlewares/auth';

export const giftRoutes = async (app: FastifyInstance) => {
    app.addHook('preHandler', authenticate);

    app.post('/send', { schema: { body: sendGiftSchema } }, giftController.sendGift);
    app.get('/sent', giftController.getSent);
    app.get('/received', giftController.getReceived);
    app.get('/:id', giftController.getOne);
    app.post('/open/:id', giftController.openGift);
};
