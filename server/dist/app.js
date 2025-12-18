"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const errorHandler_1 = require("./middlewares/errorHandler");
const auth_routes_1 = require("./routes/auth.routes");
const gift_routes_1 = require("./routes/gift.routes");
const wrapper_routes_1 = require("./routes/wrapper.routes");
const user_routes_1 = require("./routes/user.routes");
const price_routes_1 = require("./routes/price.routes");
const app = (0, fastify_1.default)({ logger: false });
// Plugins
app.register(cors_1.default, {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
});
app.register(multipart_1.default);
app.register(cookie_1.default, {
    secret: process.env.COOKIE_SECRET, // for signed cookies
    hook: 'onRequest'
});
// Validation
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
// Error Handler
app.setErrorHandler(errorHandler_1.errorHandler);
// Routes
app.register(auth_routes_1.authRoutes, { prefix: '/auth' });
app.register(gift_routes_1.giftRoutes, { prefix: '/gifts' });
app.register(wrapper_routes_1.wrapperRoutes, { prefix: '/wrappers' });
app.register(user_routes_1.userRoutes, { prefix: '/user' });
app.register(price_routes_1.priceRoutes, { prefix: '/prices' });
// app.register(paymentRoutes, { prefix: '/payments' }); NOTNOW
exports.default = app;
