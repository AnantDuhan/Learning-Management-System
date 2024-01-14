import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { getCoursesAnalytics, getOrdersAnalytics, getUserAnalytics } from '../controllers/analytics.controller';

const analyticsRouter = express.Router();

analyticsRouter
    .route('/admin/users/analytics')
    .get(isAuthenticated, authorizeRoles('admin'), getUserAnalytics);

analyticsRouter
    .route('/admin/courses/analytics')
    .get(isAuthenticated, authorizeRoles('admin'), getCoursesAnalytics);

analyticsRouter
    .route('/admin/orders/analytics')
    .get(isAuthenticated, authorizeRoles('admin'), getOrdersAnalytics);

export default analyticsRouter;
