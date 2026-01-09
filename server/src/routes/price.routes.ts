import { FastifyInstance } from 'fastify';
import { getSUI, getSOL } from '../controllers/price.controller';
import { authenticate } from '../middlewares/auth';

export async function priceRoutes(app: FastifyInstance) {
    app.addHook('preHandler', authenticate());
    app.get('/sui', getSUI);
    app.get('/sol', getSOL);
}