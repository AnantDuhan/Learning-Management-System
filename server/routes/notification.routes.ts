import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { getNotification, updateNotification } from '../controllers/notification.controller';

const notificationRouter = express.Router();

notificationRouter
    .route('/notifications/all')
    .get(isAuthenticated, authorizeRoles('admin'), getNotification);

notificationRouter
    .route('/update/notification/:id')
    .put(isAuthenticated, authorizeRoles('admin'), updateNotification);

export default notificationRouter;
