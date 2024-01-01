import express from 'express';
import { activateUser, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo } from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/auth';

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

export default userRouter;
