import { createClient } from "redis";
import { config } from '../config/env';
import redisClient from "../utils/redis";

const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SUI';
const CACHE_KEY = 'sui_price_usd';
const CACHE_TTL = 240; // 4 minutes

interface CMCResponse {
    data: {
        SUI: {
            quote: {
                USD: {
                    price: number;
                }
            }
        }
    }
}

export const getSuiPrice = async (): Promise<number> => {
    // 1. Check Redis cache
    try {
        const cachedPrice = await redisClient.get(CACHE_KEY);
        console.log('Cached Price:', cachedPrice);
        if (cachedPrice) {
            return parseFloat(cachedPrice.toString());
        }
    } catch (error) {
        console.warn('Redis read error:', error);
        // Continue to fetch if cache fails
    }

    // 2. Fetch from CoinMarketCap API
    const response = await fetch(CMC_API_URL, {
        headers: {
            'X-CMC_PRO_API_KEY': config.CMC_API_KEY,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`CoinMarketCap API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as CMCResponse;

    if (!data?.data?.SUI?.quote?.USD?.price) {
        throw new Error('Invalid response structure from CoinMarketCap');
    }

    const price = data.data.SUI.quote.USD.price;

    // 3. Store in Redis with TTL
    try {
        await redisClient.set(CACHE_KEY, price.toString(), { EX: CACHE_TTL });
    } catch (error) {
        console.warn('Redis write error:', error);
    }

    return price;
};
