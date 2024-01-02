import { NextFunction, Request, Response } from 'express';
import courseModel from '../models/course.model';
import notificationModel from '../models/notification.model';
import cloudinary from 'cloudinary';
import { createCourse, getAllCoursesService } from '../services/course.service';
import { redis } from '../config/redis';
import mongoose from 'mongoose';
import ejs from 'ejs';
import path from 'path';
import sendEmail from '../utils/sendEmail';

export const uploadCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = req.body;

        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: 'lms-courses',
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        createCourse(data, res);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const editCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: 'lms-courses',
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        const courseId = req.params.id;

        const course = await courseModel.findByIdAndUpdate(
            courseId,
            {
                $set: data,
            },
            {
                new: true,
            }
        );

        res.status(200).json({
            success: true,
            course,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// get single course -- without purchasing
export const getSingleCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        } else {
            const course = await courseModel
                .findById(courseId)
                .select(
                    '-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links'
                );

            await redis.set(courseId, JSON.stringify(course));

            res.status(200).json({
                success: true,
                course,
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// get all course -- without purchasing
export const getAllCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const isCacheExist = await redis.get('allCourses');
        if (isCacheExist) {
            const courses = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                courses,
            });
        } else {
            const courses = await courseModel
                .find()
                .select(
                    '-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links'
                );

            await redis.set('allCourses', JSON.stringify(courses));

            res.status(200).json({
                success: true,
                courses,
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// get Course content -- only for valid user
export const getCourseByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExist = userCourseList?.find(
            (course: any) => course._id.toString() === courseId
        );

        if (!courseExist) {
            return res.status(404).json({
                success: false,
                message: 'You are not eligible to access this course',
            });
        }

        const course = await courseModel.findById(courseId);
        const content = course?.courseData;

        res.status(200).json({
            success: true,
            content,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// add questions in course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { question, courseId, contentId }: IAddQuestionData = req.body;

        const course = await courseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid content Id',
            });
        }

        const courseContent = course?.courseData.find((item: any) =>
            item._id.equals(contentId)
        );

        if (!courseContent) {
            return res.status(400).json({
                success: false,
                message: 'Invalid content Id',
            });
        }

        // create a new question object
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        };

        // add this question to our course content
        courseContent.questions.push(newQuestion);

        await notificationModel.create({
            user: req.user?._id,
            title: 'New Question Received',
            message: `You have a new question in ${courseContent?.title}`,
        });

        // save the updated course content
        await course?.save();

        res.status(200).json({
            success: true,
            course,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// add answer in course question
interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { answer, courseId, contentId, questionId }: IAddAnswerData =
            req.body;

        const course = await courseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid content Id',
            });
        }

        const courseContent = course?.courseData.find((item: any) =>
            item._id.equals(contentId)
        );

        if (!courseContent) {
            return res.status(400).json({
                success: false,
                message: 'Invalid content Id',
            });
        }

        const question = courseContent?.questions?.find((item: any) =>
            item._id.equals(questionId)
        );

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Invalid question Id',
            });
        }

        // create a new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
        };

        // add this answer to our course content
        question.questionReplies.push(newAnswer);

        await course?.save();

        if (req.user?._id === question.user?._id) {
            await notificationModel.create({
                user: req.user?._id,
                title: 'New Question Reply Received',
                message: `You have a new question reply in ${courseContent?.title}`,
            });
        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            };

            console.log('DATA', data.name);

            await ejs.renderFile(
                path.join(__dirname, '../mails/question-reply.ejs'),
                data
            );

            try {
                await sendEmail({
                    email: question.user.email,
                    subject: 'Question Reply',
                    template: 'question-reply.ejs',
                    data,
                });
            } catch (error: any) {
                return res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        }

        res.status(200).json({
            success: true,
            course,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// add review in course
interface IAddReviewData {
    review: string;
    rating: number;
    userId: string;
}

export const addReview = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userCourseList = req.user?.courses;

        const courseId = req.params.id;

        // check if courseId exists in the user course list based on the id
        const courseExists = userCourseList?.some((course: any) => course._id.toString() === courseId.toString());

        if (!courseExists) {
            return res.status(404).json({
                success: false,
                message: 'You are not eligible to access this course',
            });
        }

        const course = await courseModel.findById(courseId);

        const { review, rating } = req.body as IAddReviewData;

        const reviewData: any = {
            user: req.user,
            rating,
            comment: review,
        };

        course?.reviews.push(reviewData);

        let avg = 0;

        course?.reviews.forEach((rev: any) => {
            avg += rev.rating;
        });

        if (course) {
            course.ratings = avg / course.reviews.length;
        }

        await course?.save();

        // const notification = {
        //     title: "New Review Received",
        //     message: `${req.user?.name} has given a review in ${course?.name}`,
        // }

        await notificationModel.create({
            user: req.user?._id,
            title: 'New Review Received',
            message: `${req.user?.name} has given a review in ${course?.name}`,
        });

        res.status(200).json({
            success: true,
            course
        })

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// add reply to review -- admin
interface IAddReviewData {
    comment: string;
    courseId: string;
    reviewId: string;
};

export const addReplyToReview = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { comment, courseId, reviewId } = req.body as IAddReviewData;

        const course = await courseModel.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        const review = course?.reviews?.find((rev: any) => rev._id.toString() === reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        const replyData: any = {
            user: req.user,
            comment
        };

        if (!review.commentReplies) {
            review.commentReplies = [];
        }

        review.commentReplies?.push(replyData);

        await course?.save();

        res.status(200).json({
            success: true,
            course
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// get all courses -- admin
export const getAllCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        getAllCoursesService(res);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// delete cpurse -- admin
export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await courseModel.findById(id);

        if (!course) {
            res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        await course?.deleteOne({ id });

        await redis.del(id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
