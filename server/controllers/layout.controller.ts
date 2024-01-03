import { NextFunction, Request, Response } from 'express';
import layoutModel from '../models/layout.model';
import cloudinary from 'cloudinary';
import { resolveSoa } from 'dns/promises';

// create layout
export const createLayout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { type } = req.body;
        const isTypeExist = await layoutModel.findOne({ type });
        if (isTypeExist) {
            return res.status(400).json({
                success: false,
                message: `${type} already exists`
            });
        }

        if (type === 'Banner') {
            const { image, title, subTitle } = req.body;

            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: 'lms-layout',
            });

            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
            };

            await layoutModel.create(banner);
        }

        if (type === 'FAQ') {
            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    };
                })
            )
            await layoutModel.create({type: "FAQ", faq: faqItems});
        }

        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title
                    };
                })
            );
            await layoutModel.create({type: "Categories", categories: categoriesItems});
        }

        res.status(200).json({
            success: true,
            message: 'Layout created successfully'
        })


    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// edit layout
export const editLayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;

        if (type === 'Banner') {
            const bannerData: any = await layoutModel.findOne({ type: "Banner" })
            const { image, title, subTitle } = req.body;

            if (bannerData) {
                await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
            }

            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: 'lms-layout',
            })

            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
            };

            await layoutModel.findByIdAndUpdate(bannerData?._id, {banner});
        }

        if (type === 'FAQ') {
            const { faq } = req.body;
            const faqItem = await layoutModel.findOne({ type: 'FAQ' });
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer,
                    };
                })
            );
            await layoutModel.findByIdAndUpdate(faqItem?._id, { type: 'FAQ', faq: faqItems });
        }

        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesData = await layoutModel.findOne({ type: 'Categories' });
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title,
                    };
                })
            );
            await layoutModel.findByIdAndUpdate(categoriesData?._id, {
                type: 'Categories',
                categories: categoriesItems,
            });
        }

        res.status(200).json({
            success: true,
            message: 'Layout updated successfully',
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// get layout by type
export const getLayoutByType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const layout = await layoutModel.findOne({ type });

        res.status(200).json({
            success: true,
            layout
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
