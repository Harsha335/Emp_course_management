import { useEffect, useState } from "react"
import CourseCard from "./CourseCard"
import axiosTokenInstance from "../../../api_calls/api_token_instance";
import AssignCoursePopup from "./AssignCoursePopup";
import CourseDetailsPopup from "./CourseDetailsPopup";
import PdfViewer from "./pdfViewer";


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
    return (
        <div className="p-2 flex gap-5 flex-wrap justify-around">
            {/* <CourseCard courseName="New Begginer " courseImgUrl="http://res.cloudinary.com/deppcolt3/image/upload/v1727847556/course_images/sfz2xzn95ktl8qaqnvaq.png" difficultyLevel="INTERMEDIATE" onClickAssignCourse={() => onClickAssignCourse(course)/> */}
            {
                courses && courses.map((course: CourseType) => (
                    <div key={course.course_id} onClick={() => onClickCourseDetails(course)}>
                        <CourseCard course={course} onClickAssignCourse={onClickAssignCourse}/>
                    </div>    
                ))
            }
            <PdfViewer />
            {/* <PdfViewer file={"https://drive.google.com/file/d/0B5_bYKSaSy3kNmFmSlFJYXhhUXc/view?resourcekey=0-uK29Dy3ez9Kz23D76o3XnA"} /> */}
            {coursePopupToggle && <CourseDetailsPopup course={coursePopupToggle} removePopup={removePopup}/>}
            {assignPopupToggle && <AssignCoursePopup course={assignPopupToggle} removePopup={removePopup}/>}
        </div>
    )
}

export default AllCourses
