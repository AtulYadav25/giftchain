import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const signAccessToken = (payload: object) => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '25d' });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, config.JWT_SECRET);
};

export function truncateToTwoDecimals(value) {
    if (value === null || value === undefined || value === "") return value;

    const num = Number(value);
    if (isNaN(num)) return value;

    return Math.trunc(num * 100) / 100;
}