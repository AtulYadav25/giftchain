import { FastifyInstance } from 'fastify';
import { getPrice } from '../controllers/price.controller';

export async function priceRoutes(app: FastifyInstance) {
    app.get('/sui', getPrice);
}