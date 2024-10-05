import React, { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import axiosTokenInstance from "../../../api_calls/api_token_instance";

interface Questions {
  question_id : number | null;
  question : string;
  options : string[];
  isMultipleChoice : boolean
  answers : number[];
  test_id : string | null;
}
interface QuestionBank {
  test_id : string | null;
  course_id : number;
  Questions : Questions[];
  time_per_question_in_sec : number | null;
}
interface coursesQuestionsType {
  course_id: number;
  course_name: string;
  difficulty_level: string;
  QuestionBank: QuestionBank;
}

const TestCreationForm = () => {
  const [coursesQuestions, setCoursesQuestions] = useState<coursesQuestionsType[]>();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Questions[]>([]); // To store the list of questions
  const [timePerQuestion, setTimePerQuestion] = useState<number>(1); // Default value 1
  const [timeUnit, setTimeUnit] = useState<number>(1); // Default to seconds (1 = seconds, 60 = minutes, 3600 = hours)

  useEffect(() => {
    const getData = async () => {
      try{
        const response = await axiosTokenInstance.get('/api/test/getCoursesQuestionDetails');
        console.log("getCoursesQuestionDetails: ",response);
        setCoursesQuestions(response.data.courseQuestions);
      }catch(err){
        console.log("Error at getCoursesQuestionDetails: ", err);
      }
    }
    getData();
  },[]);

  // Handle course selection
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = Number(e.target.value);
    setSelectedCourse(courseId);
    console.log({courseId,coursesQuestions })
    if (coursesQuestions && coursesQuestions.length > 0) {
      const selectedCourse = coursesQuestions.find(course => course.course_id === courseId);
      if (selectedCourse) {
        const { Questions, time_per_question_in_sec } = selectedCourse.QuestionBank || {};
        console.log({ Questions, time_per_question_in_sec } )
        setQuestions(Questions || []);
        if(time_per_question_in_sec){
          if(time_per_question_in_sec < 60){
            setTimePerQuestion(time_per_question_in_sec);
            setTimeUnit(1);
          }else if(time_per_question_in_sec < 3600){
            setTimePerQuestion(time_per_question_in_sec/60);
            setTimeUnit(60);
          }else{
            setTimePerQuestion(time_per_question_in_sec/3600);
            setTimeUnit(3600);
          }
        }
      }
    }
  };

  // Add a new empty question template
  const addQuestion = () => {
    const newQuestion: Questions = {
      question_id: null,
      question: "",
      options: [""], // Start with one empty option
      isMultipleChoice: false,
      answers: [],
      test_id: null
    };
    setQuestions([...questions, newQuestion]);
  };

  // Handle option text change
  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedQuestions[questionIndex].options.map((opt, idx) => (idx === optionIndex ? value : opt))
    };
    setQuestions(updatedQuestions);
  };

  // Add a new option to the question
  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: [...updatedQuestions[questionIndex].options, ""]
    };
    setQuestions(updatedQuestions);
  };

  // Remove an option
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    const isMultipleChoice = updatedQuestions[questionIndex].isMultipleChoice;
    if (!isMultipleChoice) {
      if(updatedQuestions[questionIndex].answers[0] === optionIndex){
        updatedQuestions[questionIndex].answers = [];
      }
      else if(updatedQuestions[questionIndex].answers[0] > optionIndex){
        updatedQuestions[questionIndex].answers = [optionIndex-1];
      }
    } else {
      const answers = updatedQuestions[questionIndex].answers.filter((i: number) => i !== optionIndex);
      updatedQuestions[questionIndex].answers = answers.map(answer => answer > optionIndex ? answer-1 : answer);
    }
    setQuestions(updatedQuestions);
  };

  // Handle selecting correct answers (for checkboxes or radio buttons)
  const handleAnswerSelection = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const isMultipleChoice = updatedQuestions[questionIndex].isMultipleChoice;

    if (!isMultipleChoice) {
      updatedQuestions[questionIndex].answers = [optionIndex]; // For radio buttons, single selection
    } else {
      // For checkboxes, toggle selection
      const answers = updatedQuestions[questionIndex].answers.includes(optionIndex)
        ? updatedQuestions[questionIndex].answers.filter((i: number) => i !== optionIndex)
        : [...updatedQuestions[questionIndex].answers, optionIndex];
      updatedQuestions[questionIndex].answers = answers;
    }
    setQuestions(updatedQuestions);
  };

  // Delete a question
  const deleteQuestion = (questionIndex: number) => {
    const updatedQuestions = questions.filter((_, index) => index !== questionIndex);
    setQuestions(updatedQuestions);
  };

  // Handle question type change
  const handleQuestionTypeChange = (questionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].isMultipleChoice = value === "checkbox";
    updatedQuestions[questionIndex].answers = []; // Reset answers when type changes
    setQuestions(updatedQuestions);
  };

  // Handle question text change
  const handleQuestionTextChange = (questionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].question = value;
    setQuestions(updatedQuestions);
  };

  // Handle time input validation
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Number(e.target.value)); // Ensure the value is >= 1
    setTimePerQuestion(value);
  };

  // Handle time unit selection
  const handleTimeUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeUnit(Number(e.target.value));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      for(const question of questions){
        if(question.question.trim().length === 0 || question.options.length === 0 || question.answers.length === 0){
          alert("Fill question correctly!!!");
          return;
        }
      }
      const questionBank = {
        course_id: selectedCourse,
        questions,
        time_per_question_in_sec: timePerQuestion * timeUnit, // Store time in seconds
      };
      const response = await axiosTokenInstance.post('/api/test/updateTest', questionBank);
      console.log(response);
      window.location.reload();
    }catch(err){
      console.log("Error at submit test: ", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create a Test</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Dropdown */}
        <div className="flex w-full justify-between items-center">
          <div>
            <label htmlFor="course" className="block text-lg font-semibold text-gray-700 mb-2">Select Course:</label>
            <select
              id="course"
              value={selectedCourse || ""}
              onChange={handleCourseChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="" disabled>-- Select Course --</option>
              {coursesQuestions && coursesQuestions.map((course: coursesQuestionsType) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name} ({course.difficulty_level})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="time_per_question" className="block text-lg font-semibold text-gray-700 mb-2">Estimated Time per Question:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="time_per_question"
                value={timePerQuestion}
                onChange={handleTimeChange}
                className="w-24 px-4 py-2 border border-gray-300 rounded-md text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="1"
              />
              <select
                value={timeUnit}
                onChange={handleTimeUnitChange}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={1}>Seconds</option>
                <option value={60}>Minutes</option>
                <option value={3600}>Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-gray-50 p-6 rounded-lg shadow-inner mb-4">

            <div className="flex justify-between items-center mb-4">
              {/* Question Number */}
              <h2 className="text-lg font-semibold text-gray-700">
                Question {questionIndex + 1}:
              </h2>

              <div className="flex flex-row gap-2 items-center">
                {/* Question Type Dropdown */}
                <select
                  value={question.isMultipleChoice ? "checkbox" : "radio"}
                  onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="radio">Single Choice</option>
                  <option value="checkbox">Multiple Choice</option>
                </select>
                {/* Delete Question Button */}
                <button
                  type="button"
                  onClick={() => deleteQuestion(questionIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <DeleteIcon className="w-6 h-6" />
                </button>

              </div>
            </div>

            {/* Question Input */}
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
              placeholder="Enter the question text"
              required
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            {/* Options */}
            {question.options.map((option: string, optionIndex: number) => (
                <div key={optionIndex}  className="flex items-center mb-2 border border-gray-300 rounded-md text-gray-700">
                  {/* Answer Selection */}
                  <input
                    type={question.isMultipleChoice ? "checkbox" : "radio"}
                    name={`answer-${questionIndex}`}
                    onChange={() => handleAnswerSelection(questionIndex, optionIndex)}
                    checked={question.answers.includes(optionIndex)}
                    className="ml-4 h-5 w-5 text-green-500 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                    className="px-4 py-2 focus:outline-none flex-1"
                  />
                  {/* Remove Option Button */}
                  <button
                    type="button"
                    onClick={() => removeOption(questionIndex, optionIndex)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ClearIcon className="w-5 h-5" />
                  </button>
                </div>
            ))}

            {/* Add Option */}
            <div
              onClick={() => addOption(questionIndex)}
              className="cursor-pointer px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-400 hover:bg-gray-100"
            >
              + Add Option
            </div>
          </div>
        ))}

        {/* Add New Question Button (as a template) */}
        <div
          onClick={addQuestion}
          className="cursor-pointer w-full bg-blue-100 text-blue-600 py-3 px-4 rounded-lg font-bold text-center hover:bg-blue-200 transition duration-200"
        >
          + Add Question Template
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition duration-200"
        >
          Submit Test
        </button>
      </form>
    </div>
  );
};

export default TestCreationForm;