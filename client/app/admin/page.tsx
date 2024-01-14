'use client';
import React, { FC, useState } from 'react';
import AdminProtected from '../hooks/useAdminProtected';
import Heading from '../utils/Heading';
import { useSelector } from 'react-redux';
import AdminSidebar from '../components/Admin/sidebar/AdminSidebar';
import DashboardHero from '../components/Admin/DashboardHero';

type Props = {};

const Page: FC<Props> = (props) => {
    const [open, setOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(0);
    const [route, setRoute] = useState('Login');
    const { user } = useSelector((state: any) => state.auth);
    return (
        <AdminProtected>
            <Heading
                title={`E-Learning - Admin Dashboard`}
                description="ELearning is a platform for students to learn and get help from teachers"
                keywords="Programming, MERN, Redux, Machine Learning"
            />

            <div className="flex h-[200vh]">
                <div className="1500px:w-[19%] w-1/5">
                    <AdminSidebar />
                </div>
                <div className="w-[85%]">
                    <DashboardHero />
                </div>
            </div>
        </AdminProtected>
    );
};

export default Page;
