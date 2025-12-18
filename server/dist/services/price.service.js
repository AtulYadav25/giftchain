"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuiPrice = void 0;
const redis_1 = require("redis");
const env_1 = require("../config/env");
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SUI';
const CACHE_KEY = 'sui_price_usd';
const CACHE_TTL = 240; // 4 minutes
const redisClient = (0, redis_1.createClient)({
    url: env_1.config.REDIS_URL
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().catch(console.error);
const getSuiPrice = async () => {
    // 1. Check Redis cache
    try {
        const cachedPrice = await redisClient.get(CACHE_KEY);
        if (cachedPrice) {
            return parseFloat(cachedPrice.toString());
        }
    }
    catch (error) {
        console.warn('Redis read error:', error);
        // Continue to fetch if cache fails
    }
    // 2. Fetch from CoinMarketCap API
    const response = await fetch(CMC_API_URL, {
        headers: {
            'X-CMC_PRO_API_KEY': env_1.config.CMC_API_KEY,
            'Accept': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`CoinMarketCap API returned ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data?.data?.SUI?.quote?.USD?.price) {
        throw new Error('Invalid response structure from CoinMarketCap');
    }
    const price = data.data.SUI.quote.USD.price;
    // 3. Store in Redis with TTL
    try {
        await redisClient.set(CACHE_KEY, price.toString(), { EX: CACHE_TTL });
    }
    catch (error) {
        console.warn('Redis write error:', error);
    }
    return price;
};
exports.getSuiPrice = getSuiPrice;
