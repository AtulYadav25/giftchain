import { FastifyInstance } from 'fastify';
import * as wrapperController from '../controllers/wrapper.controller';
import { authenticate } from '../middlewares/auth';

export const wrapperRoutes = async (app: FastifyInstance) => {
    // Public upload or protected?
    // Usually upload is protected.
    app.post('/upload', { preHandler: [authenticate] }, wrapperController.upload);

    app.get('/', wrapperController.getAll);
    app.get('/:id', wrapperController.getOne);
};
