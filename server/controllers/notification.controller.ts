import { NextFunction, Request, Response } from 'express';
import notificationModel from '../models/notification.model';
import cron from 'node-cron';

// get all notifications -- admin
export const getNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const notification = await notificationModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notification
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// update notification status -- admin
export const updateNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const notification = await notificationModel.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            })
        } else {
            notification.status ? (notification.status = 'read') : notification.status;
        }

        await notification.save();

        const notifications = await notificationModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// delete notifications -- admin
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notificationModel.deleteMany({
        status: 'read',
        createdAt: {
            $lt: thirtyDaysAgo
        }
    });
    console.log("deleted read notifications");
});
