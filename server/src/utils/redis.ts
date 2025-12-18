import { createClient } from "redis";
import { config } from "../config/env";

const redisClient = createClient({
    url: config.REDIS_URL
});

redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

redisClient.on("ready", () => {
    console.log("Redis connected");
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error", err.code, err.message);
});

redisClient.on("end", () => {
    console.warn("Redis connection closed");
});

// 🔥 explicit async initializer (correct)
export async function initRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export default redisClient;
