import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { errorHandler } from './middlewares/errorHandler';

import { authRoutes } from './routes/auth.routes';
import { giftRoutes } from './routes/gift.routes';
import { wrapperRoutes } from './routes/wrapper.routes';
import { userRoutes } from './routes/user.routes';
import { priceRoutes } from './routes/price.routes';

const app = fastify({ logger: false });

// 🔒 Rate Limit (GLOBAL)
app.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute',
    keyGenerator: (req) =>
        req.user?.address || req.cookies?.session || req.ip,
});

// Plugins
app.register(cors, {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://10.169.181.197:5173/', 'http://192.168.13.197:5173/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
});

app.register(multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 10,
    },
});

app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
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

export default app;
