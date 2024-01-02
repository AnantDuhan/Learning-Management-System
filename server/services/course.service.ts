import { Response } from 'express';
import courseModel from '../models/course.model';

// create course
export const createCourse = async (data: any, res: Response) => {
    const course = await courseModel.create(data);

    res.status(200).json({
        success: true,
        course,
    });
};

// get all courses
export const getAllCoursesService = async (res: Response) => {
    const courses = await courseModel.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        courses,
    });
};
