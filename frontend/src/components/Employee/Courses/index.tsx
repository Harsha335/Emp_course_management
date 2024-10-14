import { useEffect, useState } from "react"
import CourseCard from "./CourseCard"
import CourseDetailsPopup from "./CourseDetailsPopup";
import PDFViewer from "./PdfViewer";
import axiosTokenInstance from "../../../api_calls/api_token_instance";
import { useNavigate } from "react-router-dom";
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
export interface AssignedCourseType {
    enroll_id: number,
    current_page: number | null,
    total_pages: number | null,
    test_score: number | null,
    course_certificate_url: string | null,
    course: CourseType,
    isInQuestionBank: boolean,
    isTestAccessed: boolean
}

export interface PdfPropsDataType  {
    pdfUrl: string, 
    start_time: number,
    current_page: number | null,
    enroll_id: number
}

const Courses = () => {
    const navigate = useNavigate();
    const [assignedCourses, setAssignedCourses] = useState<AssignedCourseType[]>();
    const [coursePopupToggleData, setCoursePopupToggleData] = useState<CourseType | null>();
    const onClickCourseDetails = (course: CourseType) => {
        setCoursePopupToggleData(course);
    }
    const removePopup = () => {
        setCoursePopupToggleData(null);
        setPdfPopupToggleData(null);
    }
    useEffect(() => {
        const fetchCourses = async () => {
            try{
                const response = await axiosTokenInstance.get("/api/courses/assignedCoursesDetails");
                console.log(response.data)
                setAssignedCourses(response.data.coursesAssigned);
            }catch(err){
                console.log("Error in fetching course data (frontend)");
            }
        }
        fetchCourses();
    },[]);
    const [pdfPopupToggleData, setPdfPopupToggleData] = useState<PdfPropsDataType | null>(null);
    const onViewCourse = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, assignedCourse: AssignedCourseType) => {
        e.stopPropagation();
        const loadingToast = toast.loading("Loading PDF ...");
        const course_file_url: string = assignedCourse.course.course_file_url;
        try {
          const response = await axiosTokenInstance.post('/api/courses/getPdf',{course_file_url},{
            responseType: 'blob', // Fetch as a Blob
          });
    
          // Log the response to verify the Blob content
          console.log("Blob response: ", response.data);
    
          // Create a Blob URL for the PDF
          const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
          let pdfUrl = URL.createObjectURL(pdfBlob);
          // Clean up the URL by removing spaces
          pdfUrl = pdfUrl.replace(/\s+/g, '').trim();
          console.log("Generated Blob URL: ", pdfUrl);
    
          const start_time: number = Date.now();
          setPdfPopupToggleData({pdfUrl, start_time, current_page: assignedCourse.current_page, enroll_id: assignedCourse.enroll_id});
          toast.update(loadingToast, {
            render: "PDF file Opened Successfully!",
            type: "success",
            isLoading: false,
            autoClose: 2000, // automatically close after 2 seconds
          });
        } catch (err) {
          console.error('Error fetching the PDF:', err);
          toast.update(loadingToast, {
            render: "Error in opening File",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
    }

    const onClickTakeTest = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, assignedCourse: AssignedCourseType) => {
        e.preventDefault();
        e.stopPropagation();
        if(!assignedCourse.isInQuestionBank){
            // alert("");
            toast("No Questions Recorded");
            return;
        }
        if(!assignedCourse.isTestAccessed){
            toast("Your exam results are under admin review. Please wait for approval.");
            return;
        }
        navigate('/test', {state: {course_id:assignedCourse.course.course_id, enroll_id: assignedCourse.enroll_id, course_name: assignedCourse.course.course_name+" ("+assignedCourse.course.difficulty_level+") " }});
    }

    return (
        <div className="p-2 flex gap-5 flex-wrap justify-around">
            {
                assignedCourses && assignedCourses.map((assignedCourse: AssignedCourseType) => (
                    <div key={assignedCourse.course.course_id} onClick={() => onClickCourseDetails(assignedCourse.course)}>
                        <CourseCard assignedCourse={assignedCourse} onClickTakeTest={onClickTakeTest} onViewCourse={onViewCourse}/>
                    </div>    
                ))
            }
            {coursePopupToggleData && <CourseDetailsPopup course={coursePopupToggleData} removePopup={removePopup}/>}

            {pdfPopupToggleData && <PDFViewer data={pdfPopupToggleData} closePDFViewer={removePopup}/>}
        </div>
    )
}

export default Courses
