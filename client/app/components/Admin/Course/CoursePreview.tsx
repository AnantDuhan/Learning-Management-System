import { styles } from '../../../../app/Styles/style';
import CoursePlayer from '../../../../app/utils/CoursePlayer';
import React, { FC, useState } from 'react'
import Ratings from './Ratings';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';


type Props = {
    active: number,
    setActive: (active: number) => void;
    courseData: any;
    handleCourseCreate: any
}

const CoursePreview: FC<Props> = ({
    courseData,
    handleCourseCreate,
    active,
    setActive
}) => {

    const prevButton = () => {
        setActive(active - 1);
    };

    const handleOptions = () => {
        handleCourseCreate();
    };

    const discountPercentage =
        ((courseData?.estimatedPrice - courseData?.price) /
            courseData?.estimatedPrice) *
        100;
    const discountPercentagePrice = discountPercentage.toFixed(0);
  return (
      <div className="w-[90%] m-auto py-5 mb-5">
          <div className="w-full relative">
              <div className="w-full mt-10">
                  <CoursePlayer
                      videoUrl={courseData?.demoUrl}
                      title={courseData?.title}
                  />
              </div>
              <div className="flex items-center">
                  <h1 className="pt-5 text-[25px]">
                      {courseData?.price === 0
                          ? 'Free'
                          : '₹' + courseData?.price}
                  </h1>
                  <h5 className="pl-3 text-[20px] mt-2 line-through opacity-80">
                      ₹{courseData?.estimatedPrice}
                  </h5>

                  <h4 className="pl-5 pt-4 text-[22px]">
                      {discountPercentagePrice}% Off
                  </h4>
              </div>
              <div className="flex items-center">
                  <div
                      className={`${styles.button} !w-[180px] my-3 font-Poppins !bg-[crimson] cursor-not-allowed`}
                  >
                      Buy Now ₹{courseData?.price}
                  </div>
              </div>

              <div className="flex items-center">
                  <input
                      type="text"
                      name=""
                      id=""
                      placeholder="Discount Code..."
                      className={`${styles.input} 1500px:!w-[50%] 1100:!w-[60%] ml-3 !mt-0`}
                  />
                  <div
                      className={`${styles.button} !w-[120px] my-3 ml-4 font-Poppins cursor-pointer`}
                  >
                      Apply
                  </div>
              </div>
              <p className="pb-1">Source Code included</p>
              <p className="pb-1">Lifetime access</p>
              <p className="pb-1">Course completion certificate</p>
              <p className="pb-3 800px:pb-1">Premium Support</p>
          </div>

          <div className="w-full">
              <div className="w-full 800px:pr-5">
                  <h1 className="text-[25px] font-Poppins font-[600]">
                      {courseData?.name}
                  </h1>
                  <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center">
                          <Ratings rating={0} />
                          <h5>0 Reviews</h5>
                      </div>
                      <h5>0 Students</h5>
                  </div>
                  <br />
                  <h1 className="text-[25px] font-Poppins font-[600]">
                      What you will learn from this course?
                  </h1>
              </div>
              {courseData?.benefits?.map((item: any, index: number) => {
                  <div
                      className="w-full flex 800px:items-center py-2"
                      key={index}
                  >
                      <div className="w-[15px] mr-1">
                          <IoCheckmarkDoneOutline size={20} />
                      </div>
                      <p className="pl-2">{item.title}</p>
                  </div>;
              })}
              <br />
              <br />
              <h1 className="text-[25px] font-Poppins font-[600]">
                  What are the prerequisite for this course?
              </h1>
              {courseData?.prerequisites?.map((item: any, index: number) => (
                  <div
                      className="w-full flex py-2 800px:items-center"
                      key={index}
                  >
                      <div className="w-[15px] mr-1">
                          <IoCheckmarkDoneOutline size={20} />
                      </div>
                      <p className="pl-2">{item.title}</p>
                  </div>
              ))}
              {/* Course Description */}
              <div className="w-full">
                  <div className="text-[25px] font-sans">Course Details</div>
                  {courseData?.description}
              </div>
              <br />
              <br />
          </div>
          <div className="w-full flex items-center justify-between">
              <div className="w-full flex items-center justify-between">
                  <div
                      className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-white rounded mt-8 cursor-pointer"
                      onClick={() => prevButton()}
                  >
                      Prev
                  </div>
                  <div
                      className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-white rounded mt-8 cursor-pointer"
                      onClick={() => handleOptions()}
                  >
                      Create
                  </div>
              </div>
          </div>
      </div>
  );
}

export default CoursePreview
