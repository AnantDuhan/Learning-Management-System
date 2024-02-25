import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { createOrder, getAllOrders } from '../controllers/order.controller';
import { updateAccessToken } from '../controllers/user.controller';

const orderRouter = express.Router();

orderRouter.route('/create/order').post(isAuthenticated, createOrder);

orderRouter
    .route('/orders/all')
    .get(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        getAllOrders
    );

export default orderRouter;
