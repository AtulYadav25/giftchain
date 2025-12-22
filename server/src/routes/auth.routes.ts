import { FastifyInstance } from 'fastify';
import * as authController from '../controllers/auth.controller';
import { requestMessageSchema, verifySchema } from '../validations/auth.schema';
import { authenticate } from '../middlewares/auth';

export const authRoutes = async (app: FastifyInstance) => {
    app.post('/request-message', { schema: { body: requestMessageSchema } }, authController.requestMessage);
    app.post('/verify', { schema: { body: verifySchema } }, authController.verify);
    app.get('/me', { preHandler: [authenticate] }, authController.me);
    app.get('/disconnect', { preHandler: [authenticate] }, authController.disconnectWallet);
};
