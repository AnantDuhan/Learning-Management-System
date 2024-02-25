import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import {
    addAnswer,
    addQuestion,
    addReplyToReview,
    addReview,
    deleteCourse,
    editCourse,
    generateVideoUrl,
    getAllCourse,
    getAllCourses,
    getCourseByUser,
    getSingleCourse,
    uploadCourse,
} from '../controllers/course.controller';
import { updateAccessToken } from '../controllers/user.controller';

const courseRouter = express.Router();

courseRouter
    .route('/admin/create/course')
    .post(updateAccessToken, isAuthenticated, authorizeRoles('admin'), uploadCourse);

courseRouter
    .route('/admin/update/course/:id')
    .put(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        editCourse
    );

courseRouter.route('/course/:id').get(isAuthenticated, getSingleCourse);

courseRouter.route('/courses').get(getAllCourses);

courseRouter
    .route('/course/content/:id')
    .get(updateAccessToken, isAuthenticated, getCourseByUser);

courseRouter
    .route('/add/question')
    .put(updateAccessToken, isAuthenticated, addQuestion);

courseRouter
    .route('/add/answer')
    .put(updateAccessToken, isAuthenticated, addAnswer);

courseRouter
    .route('/add/review/:id')
    .put(updateAccessToken, isAuthenticated, addReview);

courseRouter
    .route('/admin/review/reply')
    .put(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        addReplyToReview
    );

courseRouter
    .route('/admin/courses/all')
    .get(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        getAllCourse
    );

courseRouter.route('/get/vdocipher/otp').post(generateVideoUrl);

courseRouter
    .route('/admin/delete/course/:id')
    .delete(
        updateAccessToken,
        isAuthenticated,
        authorizeRoles('admin'),
        deleteCourse
    );

export default courseRouter;
