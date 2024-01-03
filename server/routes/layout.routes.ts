import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { createLayout, editLayout, getLayoutByType } from '../controllers/layout.controller';

const layoutRouter = express.Router();

layoutRouter
    .route('/create/layout')
    .post(isAuthenticated, authorizeRoles('admin'), createLayout);

layoutRouter
    .route('/update/layout')
    .put(isAuthenticated, authorizeRoles('admin'), editLayout);

layoutRouter.route('/layout').get(getLayoutByType);

export default layoutRouter;
