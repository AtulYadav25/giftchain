import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const signAccessToken = (payload: object) => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '25d' });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, config.JWT_SECRET);
};
