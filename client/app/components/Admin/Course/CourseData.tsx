'use client';
import { styles } from '../../../../app/Styles/style';
import React, { FC } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import toast from 'react-hot-toast';

type Props = {
    benefits: {
        title: string;
    }[];
    setBenefits: (benefits: { title: string }[]) => void;
    prerequisites: { title: string }[];
    setPrerequisites: (prerequisites: { title: string }[]) => void;
    active: number;
    setActive: (active: number) => void;
};

const CourseData: FC<Props> = ({
    benefits,
    setBenefits,
    prerequisites,
    setPrerequisites,
    active,
    setActive,
}) => {
  const handleBenefitsChange = (index: number, value: any) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index].title = value;
    setBenefits(updatedBenefits);
  }

  const handleAddBenefit = () => {
    setBenefits([...benefits, {title: ''}]);
  }

  const handlePrerequisitesChange = (index: number, value: any) => {
    const updatedPrerequisites = [...prerequisites];
    updatedPrerequisites[index].title = value;
    setPrerequisites(updatedPrerequisites);
  };

  const handleAddPrerequisites = () => {
    setPrerequisites([...prerequisites, {title: ''}]);
  }

  const prevButton = () => {
    setActive(active - 1);
  }

  const handleOptions = () => {
    if (benefits[benefits.length - 1]?.title !== "" && prerequisites[prerequisites.length - 1]?.title !== "") {
      setActive(active + 1);
    } else {
      toast.error("Please fill the fields to go to the next page!");
    }
   }

  return (
      <div className="w-[80%] m-auto mt-24 block">
          <div>
              <label htmlFor="email" className={`${styles.label} text-[20px]`}>
                  What are the benefits for students in this course?
              </label>
              <br />
              {benefits.map((benefits: any, index: number) => (
                  <input
                      type="text"
                      key={index}
                      name="Benefits"
                      placeholder="You will be able to build a full stack project... "
                      required
                      value={benefits?.title}
                      onChange={(e) =>
                          handleBenefitsChange(index, e.target.value)
                      }
                      className={`${styles.input} my-2`}
                  />
              ))}
              <AddCircleIcon
                  style={{
                      margin: '10px 0px',
                      cursor: 'pointer',
                      width: '30px',
                  }}
                  onClick={handleAddBenefit}
              />
          </div>

          <div>
              <label htmlFor="email" className={`${styles.label} text-[20px]`}>
                  What are the prerequisites for starting this course?
              </label>
              <br />
              {prerequisites.map((prerequisites: any, index: number) => (
                  <input
                      type="text"
                      key={index}
                      name="Prerequisites"
                      placeholder="You need basic knowledge of MERN Stack"
                      required
                      value={prerequisites?.title}
                      onChange={(e) =>
                          handlePrerequisitesChange(index, e.target.value)
                      }
                      className={`${styles.input} my-2`}
                  />
              ))}
              <AddCircleIcon
                  style={{
                      margin: '10px 0px',
                      cursor: 'pointer',
                      width: '30px',
                  }}
                  onClick={handleAddPrerequisites}
              />
          </div>
          <div className="w-full flex items-center justify-between">
              <div
                  className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-white rounded mt-8 cursor-pointer"
                  onClick={() => prevButton()}
              >Prev</div>
              <div
                  className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-white rounded mt-8 cursor-pointer"
                  onClick={() => handleOptions()}
              >Next</div>
          </div>
      </div>
  );
};

export default CourseData;
