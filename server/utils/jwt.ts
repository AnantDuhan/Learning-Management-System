require('dotenv').config();
import { Response } from 'express';
import { IUser } from '../models/user.model';
import { redis } from '../config/redis';

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

// parse env variables to integrates with fallback values
const accessTokenExpires = parseInt(
    process.env.ACCESS_TOKEN_EXPIRE || '50000',
    10
);
const refreshTokenExpires = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE || '120000',
    10
);

// options for cookies
export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpires * 24 * 60 * 60 * 1000),
    maxAge: accessTokenExpires * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
};

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    // upload session to redis
    redis.set(user._id, JSON.stringify(user) as any);

    // only set secure to true in production
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }

    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};
