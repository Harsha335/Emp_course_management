import { useEffect, useState } from "react"
import CourseCard from "./CourseCard"
import CourseDetailsPopup from "../Courses/CourseDetailsPopup";
// import PDFViewer from "../Courses/PdfViewer";
import axiosTokenInstance from "../../../api_calls/api_token_instance";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


// Enum for difficulty level
enum DifficultyLevel {
    BASIC = "BASIC",
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    EXPERT = "EXPERT"
}

export type CourseType = {
    course_id  : number;
    course_name  : string;
    description  : string;              // Added field
    duration     : string;
    difficulty_level :DifficultyLevel;      // Changed to enum
    course_img_url: string;
    course_file_url: string;
}

export interface PdfPropsDataType  {
    pdfUrl: string, 
    start_time: number,
    current_page: number | null,
    enroll_id: number
}
export interface LearningPathType {
    learning_path_id: number,
    path_name: string,
    description: string
}

const RecommendedCourses = () => {
    // const navigate = useNavigate();
    const [assignedCourses, setAssignedCourses] = useState<CourseType[]>();
    const [coursePopupToggleData, setCoursePopupToggleData] = useState<CourseType | null>();
    const [recommended_learning_path, set_recommended_learning_path] = useState<LearningPathType | null>();
    const onClickCourseDetails = (course: CourseType) => {
        setCoursePopupToggleData(course);
    }
    const removePopup = () => {
        setCoursePopupToggleData(null);
        // setPdfPopupToggleData(null);
    }
    useEffect(() => {
        const fetchCourses = async () => {
            const loadingToast = toast.loading("Fetching Recommended Courses...");
            try{
                const response = await axiosTokenInstance.get("/api/courses/predictLearningPath");
                console.log(response.data)
                set_recommended_learning_path(response.data.recommended_learning_path);
                setAssignedCourses(response.data.data);
                toast.update(loadingToast, {
                    render: "Recommended Courses loaded successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000, // automatically close after 2 seconds
                  });
            }catch(err){
                console.log("Error in fetching course data (frontend)");
                toast.update(loadingToast, {
                    render: "Failed to load recommendations. Please try again.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                  });
            }
        }
        fetchCourses();
    },[]);
    // const [pdfPopupToggleData, setPdfPopupToggleData] = useState<PdfPropsDataType | null>(null);
    // const onViewCourse = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, assignedCourse: AssignedCourseType) => {
    //     e.stopPropagation();
    //     const course_file_url: string = assignedCourse.course.course_file_url;
    //     try {
    //       const response = await axiosTokenInstance.post('/api/courses/getPdf',{course_file_url},{
    //         responseType: 'blob', // Fetch as a Blob
    //       });
    
    //       // Log the response to verify the Blob content
    //       console.log("Blob response: ", response.data);
    
    //       // Create a Blob URL for the PDF
    //       const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
    //       let pdfUrl = URL.createObjectURL(pdfBlob);
    //       // Clean up the URL by removing spaces
    //       pdfUrl = pdfUrl.replace(/\s+/g, '').trim();
    //       console.log("Generated Blob URL: ", pdfUrl);
    
    //       const start_time: number = Date.now();
    //       setPdfPopupToggleData({pdfUrl, start_time, current_page: assignedCourse.current_page, enroll_id: assignedCourse.enroll_id});
    //     } catch (err) {
    //       console.error('Error fetching the PDF:', err);
    //     }
    // }

    // const onClickTakeTest = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, assignedCourse: AssignedCourseType) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if(!assignedCourse.isInQuestionBank){
    //         alert("No Questions Recorded");
    //         return;
    //     }
    //     if(!assignedCourse.isTestAccessed){
    //         alert("Your exam results are under admin review. Please wait for approval.");
    //         return;
    //     }
    //     navigate('/test', {state: {course_id:assignedCourse.course.course_id, enroll_id: assignedCourse.enroll_id, course_name: assignedCourse.course.course_name+" ("+assignedCourse.course.difficulty_level+") " }});
    // }
    const onClickAssignCourse = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, course_id: number) => {
        e.preventDefault();
        e.stopPropagation();
        const loadingToast = toast.loading("Assigning Course...");
        try{
            await axiosTokenInstance.post('/api/courses/assignCourse',{
                course_id
            });
            toast.update(loadingToast, {
                render: "Successfully course assigned!",
                type: "success",
                isLoading: false,
                autoClose: 2000, // automatically close after 2 seconds
              });
        }catch(err){
            console.log("Error at onClickAssignCourse: ",err);
            toast.update(loadingToast, {
                render: "Failed to Assign Course. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
        }
    }

    return (
        <div className="p-5">
        {/* Recommended Learning Path */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">
            Recommended Learning Path: 
            <span className="text-indigo-600">
            {recommended_learning_path ? ' '+recommended_learning_path.path_name : ' No path available'}
            </span>
        </h2>

        {/* Assigned Courses or No Recommendations */}
        {(assignedCourses && assignedCourses.length !== 0) ? (
            <div className="p-5 flex gap-6 flex-wrap justify-around bg-white rounded-lg shadow-md">
            {assignedCourses.map((assignedCourse: CourseType) => (
                <div
                key={assignedCourse.course_id}
                className="p-4 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onClickCourseDetails(assignedCourse)}
                >
                <CourseCard 
                    course={assignedCourse} 
                    onClickAssignCourse={onClickAssignCourse} 
                />
                </div>
            ))}

            {/* Course Details Popup */}
            {coursePopupToggleData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <CourseDetailsPopup 
                    course={coursePopupToggleData} 
                    removePopup={removePopup} 
                />
                </div>
            )}

            {/* PDF Viewer Popup (If needed in future) */}
            {/* 
            {pdfPopupToggleData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <PDFViewer data={pdfPopupToggleData} closePDFViewer={removePopup} />
                </div>
            )}
            */}
            </div>
        ) : (
            <div className="text-red-600 text-lg font-medium mt-4">
                No recommendations available!!
            </div>
        )}
        </div>

    )
}

export default RecommendedCourses