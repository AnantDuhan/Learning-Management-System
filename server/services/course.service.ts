import { Response } from 'express';
import courseModel from '../models/course.model';

// create course
export const createCourse = async (data: any, res: Response) => {
    const course = await courseModel.create(data);

    res.status(200).json({
        success: true,
        course,
    });
}
