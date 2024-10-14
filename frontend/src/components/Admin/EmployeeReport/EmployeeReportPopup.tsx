import React, { useEffect, useState } from 'react';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import axiosTokenInstance from '../../../api_calls/api_token_instance'; // Assuming this is an Axios instance for API calls
import { toast } from 'react-toastify';

// Define the interface for course data
interface CourseData {
  course_name: string;
  completion_percentage: string;
  test_score: number | string;
  total_time_spent_in_seconds: number;
  course_certificate_url: string | null;
}
interface PropsType {
  emp_id: string ;
  closePopUp: () => void;
}

const EmployeeReportPopup: React.FC<PropsType> = ({emp_id, closePopUp}) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch employee course data on component mount
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axiosTokenInstance.get(`/api/employees/course-progress/${emp_id}`);
        setCourses(response.data); // Assuming API returns the course data in expected format
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch course data');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative">
        <button
          onClick={closePopUp}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <CancelOutlinedIcon />
        </button>

        <h2 className="text-xl font-semibold mb-4">Employee Course Report</h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Course Name</th>
                <th className="border px-4 py-2">Completion %</th>
                <th className="border px-4 py-2">Test Score</th>
                <th className="border px-4 py-2">Time Spent (Sec)</th>
                <th className="border px-4 py-2">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{course.course_name}</td>
                    <td className="border px-4 py-2">{course.completion_percentage}</td>
                    <td className="border px-4 py-2">{course.test_score}</td>
                    <td className="border px-4 py-2">{course.total_time_spent_in_seconds}</td>
                    <td className="border px-4 py-2">
                      {course.course_certificate_url ? (
                        <a
                          href={course.course_certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Certificate
                        </a>
                      ) : (
                        'Not Available'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border px-4 py-2 text-center">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeeReportPopup;