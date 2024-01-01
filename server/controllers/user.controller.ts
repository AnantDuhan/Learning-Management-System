import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/user.model";
import jwt, { Secret } from "jsonwebtoken";
require('dotenv').config();
import ejs from 'ejs';
import path from 'path';
import sendEmail from "../utils/sendEmail";
import { sendToken } from "../utils/jwt";
import { redis } from "../config/redis";

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
                message: 'Email already exists!'
            });
        };

        const user: IRegistrationBody = {
            name,
            email,
            password
        };

        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = { name: user?.name, activationCode };

        const html = await ejs.renderFile(path.join(__dirname, '../mails/activation-mail.ejs'), data);

        try {
            await sendEmail({
                email: user.email,
                subject: 'Activate your account',
                template: "activation-mail.ejs",
                data
            });

            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token
            })
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: "Failed to register user!!",
                error: error.message
            })
        }

    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message
        })
    }
};

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({
        user,
        activationCode
    }, process.env.ACTIVATION_SECRET as Secret, {
        expiresIn: '5m'
    });

    return {token, activationCode}
};

// activate user
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
};

export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } =
            req.body as IActivationRequest;

        const newUser: { user: IUser; activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as Secret,
        ) as { user: IUser; activationCode: string };

        if (newUser.activationCode !== activation_code) {
            return res.status(400).json({
                success: false,
                message: 'Invalid activation code!!',
            });
        };

        const { name, email, password } = newUser.user;

        const existUser = await userModel.findOne({ email });

        if (existUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
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
            user
        });

    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message
        })
    }
};

interface ILoginRequest {
    email: string;
    password: string;
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter email and password"
            });
        };

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        };

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password',
            });
        };

        sendToken(user, 201, res);
;
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}


export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie('refresh_token', '', { maxAge: 1 });

        const userId = req.user?.id || '';
        redis.del(userId)

        res.status(200).json({
            success: true,
            message: "User logged out successfully!!"
        })
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}
