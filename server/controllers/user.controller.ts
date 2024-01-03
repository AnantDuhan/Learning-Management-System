import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/user.model';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
require('dotenv').config();
import ejs from 'ejs';
import path from 'path';
import sendEmail from '../utils/sendEmail';
import {
    accessTokenOptions,
    refreshTokenOptions,
    sendToken,
} from '../utils/jwt';
import { redis } from '../config/redis';
import { getAllUsersService, getUserById, updateUserRoleService } from '../services/user.service';
import cloudinary from 'cloudinary';

// register user
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists!',
            });
        }

        const user: IRegistrationBody = {
            name,
            email,
            password,
        };

        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = { name: user?.name, activationCode };

        await ejs.renderFile(
            path.join(__dirname, '../mails/activation-mail.ejs'),
            data
        );

        try {
            await sendEmail({
                email: user.email,
                subject: 'Activate your account',
                template: 'activation-mail.ejs',
                data,
            });

            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: 'Failed to register user!!',
                error: error.message,
            });
        }
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign(
        {
            user,
            activationCode,
        },
        process.env.ACTIVATION_SECRET as string,
        {
            expiresIn: '2d',
        }
    );

    return { token, activationCode };
};

// activate user
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { activation_token, activation_code } =
            req.body as IActivationRequest;

        const newUser: { user: IUser; activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: IUser; activationCode: string };

        if (newUser.activationCode !== activation_code) {
            return res.status(400).json({
                success: false,
                message: 'Invalid activation code!!',
            });
        }

        const { name, email, password } = newUser.user;

        const existUser = await userModel.findOne({ email });

        if (existUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
            });
        }

        const user = await userModel.create({
            name,
            email,
            password,
            isVerified: true,
        });

        res.status(201).json({
            success: true,
            user,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

interface ILoginRequest {
    email: string;
    password: string;
}

export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body as ILoginRequest;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter email and password',
            });
        }

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        sendToken(user, 201, res);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const logoutUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.cookie('access_token', '', { maxAge: 1 });
        res.cookie('refresh_token', '', { maxAge: 1 });

        const userId = req.user?.id || '';
        redis.del(userId);

        res.status(200).json({
            success: true,
            message: 'User logged out successfully!!',
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// update access token
export const updateAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;

        const decoded = jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;

        const message = 'Could not refresh token';
        if (!decoded) {
            return res.status(400).json({
                success: false,
                message,
            });
        }

        const session = await redis.get(decoded.id as string);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: 'Please login to access this resource',
            });
        }

        const user = JSON.parse(session);

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.ACCESS_TOKEN as string,
            {
                expiresIn: '5m',
            }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN as string,
            {
                expiresIn: '3d',
            }
        );

        req.user = user;

        res.cookie('access_token', accessToken, accessTokenOptions);
        res.cookie('refresh_token', refreshToken, refreshTokenOptions);

        await redis.set(user._id, JSON.stringify(user), "EX", 604800);

        res.status(200).json({
            success: true,
            accessToken,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// get user info
export const getUserInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?._id;

        getUserById(userId, res);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

interface ISocialAuthBody {
    name: string;
    email: string;
    avatar: string;
}

// social auth
export const socialAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, name, avatar } = req.body as ISocialAuthBody;
        const user = await userModel.findOne({ email });
        if (!user) {
            const newUser = await userModel.create({ email, name, avatar });
            sendToken(newUser, 200, res);
        } else {
            sendToken(user, 200, res);
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// update user info
interface IUpdateUserInfo {
    name?: string;
    email?: string;
}

export const updateUserInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email } = req.body as IUpdateUserInfo;

        const userId = req.user?._id;

        const user = await userModel.findById(userId);

        if (email && user) {
            const isEmailExist = await userModel.findOne({ email });
            if (isEmailExist) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists',
                });
            }
            user.email = email;
        }

        if (name && user) {
            user.name = name;
        }

        await user?.save();

        await redis.set(userId, JSON.stringify(user));

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// update password
interface IUpdatePassword {
    oldPassword: string;
    newPassword: string;
}

export const updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { oldPassword, newPassword } = req.body as IUpdatePassword;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please enter old & new password',
            });
        }

        const user = await userModel
            .findById(req.user?._id)
            .select('+password');
        if (user?.password === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user',
            });
        }

        const isPasswordMatch = await user?.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid old Password',
            });
        }

        user.password = newPassword;

        await user.save();

        await redis.set(req.user?._id, JSON.stringify(user));

        res.status(200).json({
            success: false,
            user,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

interface IUpdateProfilePicture {
    avatar: string;
}

// update profile picture
export const updateProfilePicture = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { avatar } = req.body;

        const userId = req.user?._id;

        const user = await userModel.findById(userId);

        if (avatar && user) {
            if (user?.avatar?.public_id) {
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: 'food-delivery-avatars',
                    width: 150,
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            } else {
                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: 'lms-avatars',
                    width: 150,
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
        }

        await user?.save();

        await redis.set(userId, JSON.stringify(user));

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// get all users -- admin
export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        getAllUsersService(res);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// update user role --admin
export const updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id, role } = req.body;
        updateUserRoleService(res, id, role);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// delete user -- admin
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user?.deleteOne({ id });

        await redis.del(id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
