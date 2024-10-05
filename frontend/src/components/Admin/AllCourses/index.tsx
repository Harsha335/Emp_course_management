import { useEffect, useState } from "react"
import CourseCard from "./CourseCard"
import axiosTokenInstance from "../../../api_calls/api_token_instance";
import AssignCoursePopup from "./AssignCoursePopup";
import CourseDetailsPopup from "./CourseDetailsPopup";
import PDFViewer from "./PdfViewer";


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
    tags :string[];
}

const AllCourses = () => {
    const [courses, setCourses] = useState<CourseType[]>();
    const [assignPopupToggle, setAssignPopupToggle] = useState<CourseType | null>();
    const [coursePopupToggle, setCoursePopupToggle] = useState<CourseType | null>();
    const onClickAssignCourse = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>,course: CourseType) => {
        event.stopPropagation();
        setAssignPopupToggle(course);
    }
    const onClickCourseDetails = (course: CourseType) => {
        setCoursePopupToggle(course);
    }
    const removePopup = () => {
        setAssignPopupToggle(null);
        setCoursePopupToggle(null);
        setPdfUrl(null);
    }
    useEffect(() => {
        const fetchCourses = async () => {
            try{
                const response = await axiosTokenInstance.get("/api/courses/allCourses");
                // console.log(response)
                setCourses(response.data.courses);
            }catch(err){
                console.log("Error in fetching course data (frontend)");
            }
        }
        fetchCourses();
    },[]);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const onViewCourse = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, course: CourseType) => {
        e.stopPropagation();
        const course_file_url: string = course.course_file_url;
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
    
          // Set the URL for rendering in react-pdf
          setPdfUrl(pdfUrl);
        } catch (err) {
          console.error('Error fetching the PDF:', err);
        }
    }

    return (
        <div className="p-2 flex gap-5 flex-wrap justify-around">
            {
                courses && courses.map((course: CourseType) => (
                    <div key={course.course_id} onClick={() => onClickCourseDetails(course)}>
                        <CourseCard course={course} onClickAssignCourse={onClickAssignCourse} onViewCourse={onViewCourse}/>
                    </div>    
                ))
            }
            {assignPopupToggle && <AssignCoursePopup course={assignPopupToggle} removePopup={removePopup}/>}
            {coursePopupToggle && <CourseDetailsPopup course={coursePopupToggle} removePopup={removePopup}/>}

            {pdfUrl && <PDFViewer pdfUrl={pdfUrl} closePDFViewer={removePopup}/>}
        </div>
    )
}

export default AllCourses
