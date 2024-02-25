import express from 'express';
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo, updateUserRole } from '../controllers/user.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';

const userRouter = express.Router();

userRouter.route('/register').post(registerUser);

userRouter.route('/activate-user').post(activateUser);

userRouter.route('/login').post(loginUser);

// userRouter.route('/logout',).get(isAuthenticated, logoutUser);

userRouter.route('/refresh').get(isAuthenticated, updateAccessToken);

userRouter.route('/me').get(updateAccessToken, isAuthenticated, getUserInfo);

userRouter.route('/social-auth').post(socialAuth);

userRouter
    .route('/update/user')
    .put(updateAccessToken, isAuthenticated, updateUserInfo);

userRouter
    .route('/update/password')
    .put(updateAccessToken, isAuthenticated, updatePassword);

userRouter
    .route('/update/avatar')
    .put(updateAccessToken, isAuthenticated, updateProfilePicture);

userRouter
    .route('/admin/users')
    .get(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        getAllUsers
    );

userRouter
    .route('/admin/update/user/role')
    .put(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        updateUserRole
    );

userRouter
    .route('/admin/delete/user/:id')
    .delete(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        deleteUser
    );


export default userRouter;
