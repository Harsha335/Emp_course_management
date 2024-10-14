// frontend/src/components/TestWindow.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosTokenInstance from '../../../api_calls/api_token_instance';
import ScorePopup from './ScrorePopup';
import { formatTime } from '../../../helper_functions/time_format';
import { toast } from 'react-toastify';

type QuestionType = {
    question_id: number;
    question: string;
    options: string[];
    isMultipleChoice: boolean;
}

const TestWindow: React.FC = () => {
    const { course_id, enroll_id,course_name }: { course_id: number, enroll_id: number,course_name: string } = useLocation().state;
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [test_id, setTestId] = useState<string | null>(null);
    const [score, setScore] = useState<{
        score : number,
        total: number,
        percentage: number
    } | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number[] }>({}); // Store user answers

    useEffect(() => {
        const fetchQuestions = async () => {
            console.log("fetchQuestions.....")
            console.log({ course_id, enroll_id })
            try {
                const response = await axiosTokenInstance.get(`/api/test/attempt/${course_id}`, {
                    params: { question_count: 10 } // Using params to handle query parameters
                });
                const { Questions, test_id, time_per_question_in_sec } : {Questions: QuestionType[], test_id: string, time_per_question_in_sec: number} = response.data.questionBank;
                setQuestions(Questions);
                console.log({Questions})
                setTestId(test_id);
                // Initialize user answers state with question IDs
                const initialUserAnswers = Questions.reduce((acc, question) => {
                    acc[question.question_id] = []; // Start with an empty array for each question
                    return acc;
                }, {} as { [key: number]: number[] });
                
                setUserAnswers(initialUserAnswers);
                setTimeLeft(time_per_question_in_sec * Questions.length);
            } catch (error) {
                console.error("Error fetching questions: ", error);
            }
        };

        const enterFullScreen = () => {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { // Safari
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { // IE/Edge
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) { // Firefox
                // Mozilla doesn't support the method directly on the element, so use the document
                (document as any).mozRequestFullScreen();
            }
        };

        fetchQuestions();
        enterFullScreen(); // Enter full screen mode

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Submit automatically when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [course_id, enroll_id]);

    const handleSelectOptionChange = (question_id: number, optionIndex: number, type: string) => {
        if(type === 'radio'){
            setUserAnswers((prev) => {
                const selectedOptions = prev[question_id] || [];
                if(selectedOptions.includes(optionIndex)){
                    return {
                        ...prev,
                        [question_id]: [], // Remove the selected option
                    };
                }else{
                    return {
                        ...prev,
                        [question_id]: [optionIndex]
                    };
                }
            });
            return;
        }
        setUserAnswers((prev) => {
            const selectedOptions = prev[question_id] || [];
            if (selectedOptions.includes(optionIndex)) {
                return {
                    ...prev,
                    [question_id]: selectedOptions.filter(index => index !== optionIndex), // Remove the selected option
                };
            } else {
                return {
                    ...prev,
                    [question_id]: [...selectedOptions, optionIndex], // Add the selected option
                };
            }
        });
    };

    const handleSubmit = async () => {
        const loadingToast = toast.loading("Submiting exam...");
        const formattedAnswers = Object.entries(userAnswers).map(([question_id, answers]) => ({
            question_id: Number(question_id),
            answers
        }));
        try {
            console.log(formattedAnswers);
            const response = await axiosTokenInstance.post(`/api/test/attempt/verify-answers`, { enroll_id, test_id, userAnswers: formattedAnswers });
            setScore(response.data);
            toast.update(loadingToast, {
                render: "Successfully submited 🥳!",
                type: "success",
                isLoading: false,
                autoClose: 2000, // automatically close after 2 seconds
              });
        } catch (error) {
            console.error("Error submitting answers: ", error);
            toast.update(loadingToast, {
                render: "Submit Exam failed. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
        
        }
    };

    return (
        <div className="flex flex-col items-center justify-center relative bg-gray-50 min-h-screen py-10">
            <div className="absolute top-4 right-4 text-xl">
                <span className={`fixed top-7 right-7 font-medium ${timeLeft <= 5 * 60 ? 'text-red-600' : 'text-gray-800'}`}>
                    Time Left: <span className="font-bold">{formatTime(timeLeft)}</span>
                </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8">{course_name}</h1>
            <div className="bg-white shadow-lg rounded-lg p-8 w-11/12 md:w-9/12 lg:w-7/12 mx-auto">
                {questions && questions.map((question) => (
                    <div key={question.question_id} className="mb-6 border-b border-gray-300 pb-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">{question.question}</h2>
                        <div className="flex flex-col">
                            {question.options.map((option: string, i: number) => (
                                <label key={i} className="flex items-center mb-2 cursor-pointer">
                                    <input
                                        type={question.isMultipleChoice ? 'checkbox' : 'radio'}
                                        checked={userAnswers[question.question_id]?.includes(i)}
                                        onChange={() => handleSelectOptionChange(question.question_id, i, question.isMultipleChoice ? 'checkbox' : 'radio')}
                                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-gray-600">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button
                    className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition duration-300"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
                {score !== null && <ScorePopup data={score}/>}
            </div>
        </div>

    );
};

export default TestWindow;