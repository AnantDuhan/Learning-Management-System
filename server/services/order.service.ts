import { NextFunction, Response } from 'express';
import orderModel from '../models/order.model';

export const newOrder = async (data: any, res: Response, next: NextFunction) => {
    const order = await orderModel.create(data);

    res.status(201).json({
        success: true,
        order,
    });
}


