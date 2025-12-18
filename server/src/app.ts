import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import cookie from '@fastify/cookie';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { giftRoutes } from './routes/gift.routes';
import { wrapperRoutes } from './routes/wrapper.routes';
import { paymentRoutes } from './routes/payment.routes';
import { userRoutes } from './routes/user.routes';
import { priceRoutes } from './routes/price.routes';

const app = fastify({ logger: false });

// Plugins
app.register(cors, {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
});
app.register(multipart);
app.register(cookie, {
    secret: process.env.COOKIE_SECRET, // for signed cookies
    hook: 'onRequest'
});

// Validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Error Handler
app.setErrorHandler(errorHandler);

// Routes
app.register(authRoutes, { prefix: '/auth' });
app.register(giftRoutes, { prefix: '/gifts' });
app.register(wrapperRoutes, { prefix: '/wrappers' });
app.register(userRoutes, { prefix: '/user' });
app.register(priceRoutes, { prefix: '/prices' });
// app.register(paymentRoutes, { prefix: '/payments' }); NOTNOW

export default app;
