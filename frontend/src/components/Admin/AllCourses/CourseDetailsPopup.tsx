import React, { useEffect, useState } from 'react';
import { CourseType } from '.';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axiosTokenInstance from '../../../api_calls/api_token_instance';

type ParamsType = {
  course: CourseType;
  removePopup: () => void;
};

// Helper function to get color based on difficulty level
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
type LearningPathType = {
  learningPath: {
    path_name : string,
    description: string,
    learning_path_id: number
  }
}

const CourseDetailsPopup: React.FC<ParamsType> = ({ course, removePopup }) => {
  const [learning_paths, setLearningPaths] = useState<LearningPathType[] | null>();
  useEffect(() => {
    const getData = async () => {
      try{
        const response = await axiosTokenInstance.post('/api/courses/courseLearningPaths', {course_id: course.course_id});
        setLearningPaths(response.data.learning_paths)
        console.log(response);
      }catch(err){
        console.log("Error at learningPath fetch");
      }
    }
    getData();
  },[]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={removePopup}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <CancelOutlinedIcon />
        </button>

        {/* Course Image */}
        <img
          src={course.course_img_url}
          alt={course.course_name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />

        {/* Course Name */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">{course.course_name}</h2>

        {/* Description */}
        <p className="text-gray-700 mb-4 leading-relaxed text-justify italic">
          {course.description}
        </p>

        {/* Difficulty Level */}
        <div className={`inline-block font-medium mb-4`}>
          <strong>Difficulty Level:</strong> <span className={`px-3 py-1 rounded-lg text-sm  font-semibold ${getDifficultyColor(course.difficulty_level)}`}>{course.difficulty_level}</span>
        </div>

        {/* Duration */}
        <p className="text-gray-700 font-medium mb-4">
          <strong>Expected Duration:</strong> {course.duration}
        </p>

        {/* Tags */}
        <div className="text-gray-700 font-medium mb-4">
            <strong><LocalOfferIcon/> Learning Paths</strong>
            <div className='flex flex-wrap gap-2'>
              {learning_paths && learning_paths.length > 0 ? (
                  learning_paths.map((learning_path) => (
                      <span
                          key={learning_path.learningPath.learning_path_id}
                          className="px-3 py-1 bg-gray-100 text-sm rounded-full shadow-md text-gray-800"
                      >
                          {learning_path.learningPath.path_name}
                      </span>
                  ))
              ) : (
                  <div> {"-- No learning Paths --"} </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPopup;
