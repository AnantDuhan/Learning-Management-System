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

const courseRouter = express.Router();

courseRouter
    .route('/admin/create/course')
    .post(isAuthenticated, authorizeRoles('admin'), uploadCourse);

courseRouter
    .route('/admin/update/course/:id')
    .put(isAuthenticated, authorizeRoles('admin'), editCourse);

courseRouter.route('/course/:id').get(isAuthenticated, getSingleCourse);

courseRouter.route('/courses').get(isAuthenticated, getAllCourses);

courseRouter.route('/course/content/:id').get(isAuthenticated, getCourseByUser);

courseRouter.route('/add/question').put(isAuthenticated, addQuestion);

courseRouter.route('/add/answer').put(isAuthenticated, addAnswer);

courseRouter.route('/add/review/:id').put(isAuthenticated, addReview);

courseRouter
    .route('/admin/review/reply')
    .put(isAuthenticated, authorizeRoles('admin'), addReplyToReview);

courseRouter
    .route('/admin/courses/all')
    .get(isAuthenticated, authorizeRoles('admin'), getAllCourse);

courseRouter.route('/get/vdocipher/otp').post(generateVideoUrl);

courseRouter
    .route('/admin/delete/course/:id')
    .delete(isAuthenticated, authorizeRoles('admin'), deleteCourse);

export default courseRouter;
