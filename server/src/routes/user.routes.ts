import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

export const userRoutes = async (app: FastifyInstance) => {
    // Get Public User Details
    app.get('/:username', userController.getPublicUserDetails);

    // Update Current User Profile
    app.patch('/profile', { preHandler: [authenticate] }, userController.updateProfile);
};
