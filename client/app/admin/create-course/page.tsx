'use client'
import DashboardHeader from '../../../app/components/Admin/DashboardHeader';
import AdminSidebar from '../../../app/components/Admin/sidebar/AdminSidebar';
import Heading from '../../../app/utils/Heading';
import React, { FC } from 'react'
import CreateCourse from '../../../app/components/Admin/Course/CreateCourse';
import AdminProtected from '../../../app/hooks/useAdminProtected';

type Props = {}

const Page: FC<Props> = (props) => {
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
                      <CreateCourse />
                  </div>
              </div>
          </AdminProtected>
      </div>
  );
}

export default Page
