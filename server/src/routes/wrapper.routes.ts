import { FastifyInstance } from 'fastify';
import * as wrapperController from '../controllers/wrapper.controller';
import { authenticate } from '../middlewares/auth';

export const wrapperRoutes = async (app: FastifyInstance) => {
    app.post('/upload', { preHandler: [authenticate] }, wrapperController.upload);

    app.get('/', { preHandler: [authenticate] }, wrapperController.getAll);
    app.get('/:id', { preHandler: [authenticate] }, wrapperController.getOne);
    app.delete('/:id', { preHandler: [authenticate] }, wrapperController.deleteWrapper);

};
