import { FastifyInstance } from 'fastify';
import * as authController from '../controllers/auth.controller';
import { signupSchema, loginSchema, refreshTokenSchema } from '../validations/auth.schema';
import { authenticate } from '../middlewares/auth';

export const authRoutes = async (app: FastifyInstance) => {
    app.post('/signup', { schema: { body: signupSchema } }, authController.signup);
    app.post('/login', { schema: { body: loginSchema } }, authController.login);
    app.post('/refresh-token', { schema: { body: refreshTokenSchema } }, authController.refresh);
    app.get('/me', { preHandler: [authenticate] }, authController.me);
};
