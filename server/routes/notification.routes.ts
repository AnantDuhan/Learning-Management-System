import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { getNotification, updateNotification } from '../controllers/notification.controller';
import { updateAccessToken } from '../controllers/user.controller';

const notificationRouter = express.Router();

notificationRouter
    .route('/notifications/all')
    .get(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        getNotification
    );

notificationRouter
    .route('/update/notification/:id')
    .put(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        updateNotification
    );

export default notificationRouter;
