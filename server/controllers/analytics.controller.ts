import { NextFunction, Request, Response } from 'express';
import { generateLast12MonthsData } from '../utils/analytics.generator';
import userModel from '../models/user.model';
import courseModel from '../models/course.model';
import OrderModel from '../models/order.model';

// user data analytics
export const getUserAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await generateLast12MonthsData(userModel);

        res.status(200).json({
            success: true,
            users
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// user courses analytics
export const getCoursesAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const courses = await generateLast12MonthsData(courseModel);

        res.status(200).json({
            success: true,
            courses
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// user orders analytics
export const getOrdersAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orders = await generateLast12MonthsData(OrderModel);

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
