import express, { Response, Request, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
require('dotenv').config();

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.ORIGIN
}));

app.get('/test', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working successfully"
    });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.status = 404;
    next(err);
})
