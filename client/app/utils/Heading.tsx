import React, { FC } from 'react';

interface HeadProps {
    title: string;
    description: string;
    keywords: string;
}

const Heading: FC<HeadProps> = ({title, description, keywords}) => {
    return (
        <>
            <title>{title}</title>
            <meta className="viewport" content='width=device-width, initial-scale=1' />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
        </>
    )
};

export default Heading;
