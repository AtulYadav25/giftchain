import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const signAccessToken = (payload: object) => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '25d' });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, config.JWT_SECRET);
};

export function truncateSmart(value: string | number) {
    if (value === null || value === undefined || value === "") return value;

    const num = Number(value);
    if (isNaN(num)) return value;

    const absNum = Math.abs(num);

    // Convert to string to inspect decimals safely
    const [, decimals = ""] = absNum.toString().split(".");

    let decimalsToKeep = 2;

    // Case: number < 1 and first decimal digit is 0
    if (absNum < 1 && decimals[0] === "0") {
        decimalsToKeep = 3;
    }

    const factor = Math.pow(10, decimalsToKeep);
    return Number(Math.trunc(num * factor) / factor);
}
