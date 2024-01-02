import { NextFunction, Response } from 'express';
import orderModel from '../models/order.model';

export const newOrder = async (data: any, res: Response, next: NextFunction) => {
    const order = await orderModel.create(data);

    res.status(201).json({
        success: true,
        order,
    });
}

// get all ordrrs
export const getAllOrdersService = async (res: Response) => {
    const orders = await orderModel.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        orders,
    });
};

