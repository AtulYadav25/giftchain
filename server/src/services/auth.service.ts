import { User } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

export const signup = async (data: any) => {
    const existing = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
    if (existing) throw new Error('User already exists');

    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
        username: data.username,
        email: data.email,
        passwordHash
    });

    return user;
};

export const login = async (data: any) => {
    const user = await User.findOne({ email: data.email });
    if (!user) throw new Error('Invalid credentials');

    const match = await comparePassword(data.password, user.passwordHash);
    if (!match) throw new Error('Invalid credentials');

    const accessToken = signAccessToken({ userId: user._id, username: user.username });
    const refreshToken = signRefreshToken({ userId: user._id });

    return { user, accessToken, refreshToken };
};

export const refreshToken = async (token: string) => {
    const decoded: any = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error('User not found');

    const newAccessToken = signAccessToken({ userId: user._id, username: user.username });
    return { accessToken: newAccessToken };
};
