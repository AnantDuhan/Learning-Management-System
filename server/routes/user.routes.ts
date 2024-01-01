import express from 'express';
import { activateUser, loginUser, logoutUser, registerUser } from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/auth';

const userRouter = express.Router();

userRouter.route('/register').post(registerUser);

userRouter.route('/activate-user').post(activateUser);

userRouter.route('/login').post(loginUser);

userRouter.get('/logout', isAuthenticated, logoutUser);

export default userRouter;
