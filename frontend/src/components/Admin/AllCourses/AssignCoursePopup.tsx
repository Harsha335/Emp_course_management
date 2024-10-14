import React, { useEffect, useState } from 'react';
import { CourseType } from '.';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import axiosTokenInstance from '../../../api_calls/api_token_instance';
import { toast } from 'react-toastify';

type ParamsType = {
  course: CourseType;
  removePopup: () => void;
};

type CourseEmpType = {
  assignedCourse: boolean;
  designation: string;
  email: string;
  emp_id: string;
  emp_name: string;
};

const AssignCoursePopup: React.FC<ParamsType> = ({ course, removePopup }) => {
  const [courseEmp, setCourseEmp] = useState<CourseEmpType[]>();
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Search state

  // Fetch employee data for the course
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axiosTokenInstance.get(`/api/courses/courseEmp/${course.course_id}`);
        // console.log(response.data.courseEmp);
        setCourseEmp(response.data.courseEmp);
      } catch (err) {
        console.log('error at course-emp: ', err);
      }
    };
    getData();
  }, [course.course_id]);

  // Handle selection of employees
  const handleCheckboxChange = (emp_id: string) => {
    setSelectedEmpIds((prevSelected) =>
      prevSelected.includes(emp_id)
        ? prevSelected.filter((id) => id !== emp_id)
        : [...prevSelected, emp_id]
    );
  };

  // Filter employees based on search term
  const filteredCourseEmp = courseEmp?.filter((emp) =>
    emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignCourse = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const loadingToast = toast.loading("Assigning Courses...");
    try{
        // console.log(selectedEmpIds);
        const response = await axiosTokenInstance.post(`/api/courses/courseEmp/${course.course_id}`, {selectedEmpIds});
        console.log(response);
        removePopup();
        toast.update(loadingToast, {
          render: "Successfully Assigned Courses!",
          type: "success",
          isLoading: false,
          autoClose: 2000, // automatically close after 2 seconds
        });
    }catch(err){
        console.log("Error at handleAssignCourse: ",err);
        toast.update(loadingToast, {
          render: "Assigning Courses failed. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
  
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <button
          onClick={removePopup}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <CancelOutlinedIcon />
        </button>

        <h2 className="text-xl font-semibold mb-4">Assign Course to Employees</h2>

        {/* Search Box */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Employee ID"
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg shadow-sm"
        />

        {/* Employee List */}
        <div className="w-full p-2 border border-gray-300 rounded-lg shadow-sm h-40 overflow-y-scroll">
          {filteredCourseEmp ?
            filteredCourseEmp.map((emp) => (
              <div key={emp.emp_id} className="flex items-start gap-2 mb-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  value={emp.emp_id}
                  checked={selectedEmpIds.includes(emp.emp_id)}
                  onChange={() => handleCheckboxChange(emp.emp_id)}
                  disabled={emp.assignedCourse}
                  className="h-4 w-4 mt-1"
                />
                {/* Employee Info */}
                <div className={`flex flex-col ${emp.assignedCourse ? 'text-gray-400' : 'text-gray-700'}`}>
                  <span className="font-bold">{emp.emp_id}</span>
                  <span className="text-sm">
                    {emp.emp_name} {'('}
                    <span className="text-xs text-gray-500">{emp.email}</span>
                    {')'}
                  </span>
                </div>
              </div>
            )): <div>No Employees</div>}
        </div>

        {/* Assign Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={(e) => handleAssignCourse(e)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
          >
            Assign Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCoursePopup;