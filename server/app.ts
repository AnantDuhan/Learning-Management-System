import express, { Response, Request, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes';
import courseRouter from './routes/course.routes';
import orderRouter from './routes/order.routes';
import notificationRouter from './routes/notification.routes';
import analyticsRouter from './routes/analytics.routes';
import layoutRouter from './routes/layout.routes';
require('dotenv').config();

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));

app.use('/api/v1', userRouter);
app.use('/api/v1', courseRouter);
app.use('/api/v1', orderRouter);
app.use('/api/v1', notificationRouter);
app.use('/api/v1', analyticsRouter);
app.use('/api/v1', layoutRouter);

app.get('/test', (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working successfully"
    });
});

app.all("*", (req: Request, _res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.status = 404;
    next(err);
})
