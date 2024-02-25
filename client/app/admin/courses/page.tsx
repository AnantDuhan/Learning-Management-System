'use client'
import AdminProtected from '../../../app/hooks/useAdminProtected';
import DashboardHeader from '../../../app/components/Admin/DashboardHeader';
import AdminSidebar from '../../../app/components/Admin/sidebar/AdminSidebar';
import Heading from '../../../app/utils/Heading';
import React, { FC } from 'react'
// import DashboardHero from '../../../app/components/Admin/DashboardHero';

type Props = {}

const Page:FC<Props> = () => {
  return (
      <div>
          <AdminProtected>
              <Heading
                  title="ELearning"
                  description="ELearning is a platform for students to learn and get help from teachers"
                  keywords="Programming, MERN, Redux, Machine Learning"
              />
              <div className="flex">
                  <div className="1500px:w-[19%] w-1/5">
                      <AdminSidebar />
                  </div>
                  <div className="w-[85%]">
                      <DashboardHeader />
                  </div>
              </div>
          </AdminProtected>
      </div>
  );
}

export default Page
