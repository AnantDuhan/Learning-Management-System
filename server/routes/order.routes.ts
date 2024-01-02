import express from 'express';
import { isAuthenticated } from '../middlewares/auth';
import { createOrder } from '../controllers/order.controller';

const orderRouter = express.Router();

orderRouter.route('/create/order').post(isAuthenticated, createOrder);

export default orderRouter;
