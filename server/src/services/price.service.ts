import { createClient } from "redis";
import { config } from '../config/env';
import redisClient from "../utils/redis";

const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
const SUI_CACHE_KEY = 'sui_price_usd';
const SOL_CACHE_KEY = 'sol_price_usd';
const CACHE_TTL = 240; // 4 minutes

interface CMCSUIResponse {
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


interface CMCSOLResponse {
    data: {
        SOL: {
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
        const cachedPrice = await redisClient.get(SUI_CACHE_KEY);
        if (cachedPrice) {
            return parseFloat(cachedPrice.toString());
        }
    } catch (error) {
        console.warn('Redis read error:', error);
        // Continue to fetch if cache fails
    }

    // 2. Fetch from CoinMarketCap API
    const response = await fetch(`${CMC_API_URL}?symbol=SUI`, {
        headers: {
            'X-CMC_PRO_API_KEY': config.CMC_API_KEY,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`CoinMarketCap API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as CMCSUIResponse;

    if (!data?.data?.SUI?.quote?.USD?.price) {
        throw new Error('Invalid response structure from CoinMarketCap');
    }

    const price = data.data.SUI.quote.USD.price;

    // 3. Store in Redis with TTL
    try {
        await redisClient.set(SUI_CACHE_KEY, price.toString(), { EX: CACHE_TTL });
    } catch (error) {
        console.warn('Redis write error:', error);
    }

    return price;
};

export const getSolPrice = async (): Promise<number> => {
    // 1. Check Redis cache
    try {
        const cachedPrice = await redisClient.get(SOL_CACHE_KEY);
        if (cachedPrice) {
            return parseFloat(cachedPrice.toString());
        }
    } catch (error) {
        console.warn('Redis read error:', error);
        // Continue to fetch if cache fails
    }

    // 2. Fetch from CoinMarketCap API
    const response = await fetch(`${CMC_API_URL}?symbol=SOL`, {
        headers: {
            'X-CMC_PRO_API_KEY': config.CMC_API_KEY,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`CoinMarketCap API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as CMCSOLResponse;

    if (!data?.data?.SOL?.quote?.USD?.price) {
        throw new Error('Invalid response structure from CoinMarketCap');
    }

    const price = data.data.SOL.quote.USD.price;

    // 3. Store in Redis with TTL
    try {
        await redisClient.set(SOL_CACHE_KEY, price.toString(), { EX: CACHE_TTL });
    } catch (error) {
        console.warn('Redis write error:', error);
    }

    return price;
};
