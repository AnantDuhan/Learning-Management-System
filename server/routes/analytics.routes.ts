import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { getCoursesAnalytics, getOrdersAnalytics, getUserAnalytics } from '../controllers/analytics.controller';

const analyticsRouter = express.Router();

analyticsRouter
    .route('/users/analytics')
    .get(isAuthenticated, authorizeRoles('admin'), getUserAnalytics);

analyticsRouter
    .route('/courses/analytics')
    .get(isAuthenticated, authorizeRoles('admin'), getCoursesAnalytics);

analyticsRouter
    .route('/orders/analytics')
    .get(isAuthenticated, authorizeRoles('admin'), getOrdersAnalytics);

export default analyticsRouter;
