import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';

const start = async () => {
    await connectDB();

    try {
        await app.listen({ port: parseInt(config.PORT), host: '0.0.0.0' });
        console.log(`🚀 Server running on port ${config.PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
