import { FastifyInstance } from 'fastify';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth';

export const paymentRoutes = async (app: FastifyInstance) => {
    app.addHook('preHandler', authenticate);

    app.post('/sui/send', paymentController.sendSui);
    app.get('/sui/balance', paymentController.getSuiBalance);

    app.post('/sol/send', paymentController.sendSol); // Via Ika MPC
    app.get('/sol/balance', paymentController.getSolBalance);
};
