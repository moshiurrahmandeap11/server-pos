import Redis from "ioredis";
import { env } from "../config/env";

const redis = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        if (times > 3) return null; // stop reconnecting if Redis is not locally available yet
        return Math.min(times * 200, 2000);
    }
});

redis.on("error", (err) => {
    // Avoid crashing server if Redis service is not booted yet
    console.warn("[Redis Warning] Connection error (continuing without cache):", err.message);
});

export { redis };
