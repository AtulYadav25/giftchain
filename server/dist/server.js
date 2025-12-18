"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const start = async () => {
    await (0, db_1.connectDB)();
    try {
        await app_1.default.listen({ port: parseInt(env_1.config.PORT), host: '0.0.0.0' });
        console.log(`🚀 Server running on port ${env_1.config.PORT}`);
    }
    catch (err) {
        app_1.default.log.error(err);
        process.exit(1);
    }
};
start();
