import mongoose, { Document, Schema } from 'mongoose';

interface FaqItem extends Document {
    question: string;
    answer: string;
};

interface Category extends Document {
    title: string;
}

interface BannerImage extends Document {
    public_id: string;
    url: string;
}

interface Layout extends Document {
    type: string;
    faq: FaqItem[];
    categories: Category[];
    banner: {
        image: BannerImage;
        title: string;
        subTitle: string;
    };
}

const faqSchema = new Schema<FaqItem>({
    question: String,
    answer: String,
});

const categorySchema = new Schema<Category>({
    title: String,
});

const BannerImageSchema = new Schema<BannerImage>({
    public_id: String,
    url: String,
});

const layoutSchema = new Schema<Layout>({
    type: String,
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: [BannerImageSchema],
        title: String,
        subTitle: String,
    }
});

const layoutModel = mongoose.model<Layout>('Layout', layoutSchema);

export default layoutModel;
