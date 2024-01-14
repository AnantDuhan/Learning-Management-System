import express from 'express';
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo, updateUserRole } from '../controllers/user.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';

const userRouter = express.Router();

userRouter.route('/register').post(registerUser);

userRouter.route('/activate-user').post(activateUser);

userRouter.route('/login').post(loginUser);

userRouter.route('/logout',).get(isAuthenticated, logoutUser);

userRouter.route('/refresh').get(updateAccessToken);

userRouter.route('/me').get(isAuthenticated, getUserInfo);

userRouter.route('/social-auth').post(socialAuth);

userRouter.route('/update/user').put(isAuthenticated, updateUserInfo);

userRouter.route('/update/password').put(isAuthenticated, updatePassword);

userRouter.route('/update/avatar').put(isAuthenticated, updateProfilePicture);

userRouter.route('/admin/users').get(isAuthenticated, authorizeRoles('admin'), getAllUsers);

userRouter
    .route('/admin/update/user/role')
    .put(isAuthenticated, authorizeRoles('admin'), updateUserRole);

userRouter
    .route('/admin/delete/user/:id')
    .delete(isAuthenticated, authorizeRoles('admin'), deleteUser);


export default userRouter;
