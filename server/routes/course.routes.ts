import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import {
    addAnswer,
    addQuestion,
    addReplyToReview,
    addReview,
    editCourse,
    getAllCourses,
    getCourseByUser,
    getSingleCourse,
    uploadCourse,
} from '../controllers/course.controller';

const courseRouter = express.Router();

courseRouter
    .route('/create/course')
    .post(isAuthenticated, authorizeRoles('admin'), uploadCourse);

courseRouter
    .route('/update/course/:id')
    .put(isAuthenticated, authorizeRoles('admin'), editCourse);

courseRouter.route('/course/:id').get(isAuthenticated, getSingleCourse);

courseRouter.route('/courses').get(isAuthenticated, getAllCourses);

courseRouter.route('/course/content/:id').get(isAuthenticated, getCourseByUser);

courseRouter.route('/add/question').put(isAuthenticated, addQuestion);

courseRouter.route('/add/answer').put(isAuthenticated, addAnswer);

courseRouter.route('/add/review/:id').put(isAuthenticated, addReview);

courseRouter
    .route('/review/reply')
    .put(isAuthenticated, authorizeRoles('admin'), addReplyToReview);

export default courseRouter;
