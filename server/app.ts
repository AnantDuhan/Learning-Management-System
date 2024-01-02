import express, { Response, Request, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes';
import courseRouter from './routes/course.routes';
import orderRouter from './routes/order.routes';
require('dotenv').config();

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.ORIGIN
}));

app.use('/api/v1', userRouter);
app.use('/api/v1', courseRouter);
app.use('/api/v1', orderRouter);

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
