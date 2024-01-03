import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redis } from '../config/redis';

export const isAuthenticated = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const access_token = req.cookies.access_token as string;

    if (!access_token) {
        return res.status(400).json({
            success: false,
            message: 'Please login to access this resourse!',
        });
    }

    const decoded = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    if (!decoded) {
        return res.status(400).json({
            success: false,
            message: 'access token is not valid!!',
        });
    }

    const user = await redis.get(decoded.id);

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Please login to access this resource',
        });
    }

    req.user = JSON.parse(user);

    next();
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user?.role} is not allowed to access this resource`,
            });
        }
        next();
    };
};
