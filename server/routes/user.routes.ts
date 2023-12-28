import express from 'express';
import { activateUser, loginUser, logoutUser, registerUser } from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.route('/register').post(registerUser);

userRouter.route('/activate-user').post(activateUser);

userRouter.route('/login').post(loginUser);

userRouter.route('/logout').get(logoutUser);

export default userRouter;
