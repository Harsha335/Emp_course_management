import React, { useState } from 'react';
// import { RibbonContainer,  Ribbon } from "react-ribbons";
// import VisibilityIcon from '@mui/icons-material/Visibility';
import { CourseType } from '.';

interface CourseCardProps {
  course: CourseType;
  onClickAssignCourse: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, course_id: number) => void;
}

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BASIC':
        return 'bg-green-500 text-white';
      case 'BEGINNER':
        return 'bg-blue-500 text-white';
      case 'INTERMEDIATE':
        return 'bg-yellow-500 text-black';
      case 'EXPERT':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
};

const ribbonStyle = {
    '--f': '10px',
    '--r': '15px',
    '--t': '10px',
    inset: 'var(--t) calc(-1 * var(--f)) auto auto',
    padding: `0 10px var(--f) calc(10px + var(--r))`,
    clipPath: `polygon(0 0, 100% 0, 100% calc(100% - var(--f)), calc(100% - var(--f)) 100%, 
      calc(100% - var(--f)) calc(100% - var(--f)), 0 calc(100% - var(--f)), 
      var(--r) calc(50% - var(--f) / 2)`,
    boxShadow: '0 calc(-1 * var(--f)) 0 inset #0005'
};

const CourseCard: React.FC<CourseCardProps> = ({course, onClickAssignCourse}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    // <RibbonContainer>
        <div className="w-80 rounded-lg shadow-lg bg-white relative flex flex-col cursor-pointer transform hover:scale-105 transition-transform duration-300
">
            {/* Course Image */}
            <div className="h-48">
              {/* Loading spinner */}
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
                  <div className="w-full h-full"></div>
                </div>
              )}
              
              {/* Image */}
              <img
                src={course.course_img_url}
                alt={course.course_name}
                className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setIsLoaded(true)}
              />
          </div>
            {/* <Ribbon
                side="right"
                type="edge"
                size="normal"
                backgroundColor={getRibbonColor(course.difficulty_level)}
                color="#ccffff"
                fontFamily="sans"
                withStripes={true}
            >
                    {course.difficulty_level}
            </Ribbon> */}
            {/* <div className="relative max-w-md mx-auto my-12 bg-lightblue-200 h-52"> */}
            <div className={`absolute ${getDifficultyColor(course.difficulty_level)}`} style={ribbonStyle}>{course.difficulty_level}</div>
            {/* </div>/ */}

            {/* Course Name & Button */}
            <div className="flex flex-col gap-2 justify-around p-2">
              <div className='h-[3rem] flex gap-2 justify-between items-center'>
                <div className="text-lg font-semibold line-clamp-2 overflow-hidden">{course.course_name}</div>
                <div className="flex flex-row gap-2">
                    <button
                        onClick={(e) => onClickAssignCourse(e, course.course_id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap focus:outline-none shadow-lg"
                        >
                        Enroll Course
                    </button>
                </div>
              </div>
            </div>
        </div>
    // </RibbonContainer>
  );
};

export default CourseCard;