import React, { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';

// Sample data structure for course list
const courses = [
  { course_id: 1, course_name: "React Basics", difficulty_level: "BEGINNER" },
  { course_id: 2, course_name: "Advanced Node.js", difficulty_level: "INTERMEDIATE" },
  { course_id: 3, course_name: "Machine Learning", difficulty_level: "EXPERT" },
];

const TestCreationForm = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]); // To store the list of questions

  // Handle course selection
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(Number(e.target.value));
  };

  // Add a new empty question template
  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: [""], // Start with one empty option
      isMultipleChoice: false,
      answers: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  // Handle option text change
  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  // Add a new option to the question
  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  // Remove an option
  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  // Handle selecting correct answers (for checkboxes or radio buttons)
  const handleAnswerSelection = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const isMultipleChoice = updatedQuestions[questionIndex].isMultipleChoice;

    if (isMultipleChoice) {
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const questionBank = {
      test_id: Math.random().toString(36).substring(2, 15), // Random ID for demo purposes
      course_id: selectedCourse,
      questions,
    };
    console.log(questionBank); // Simulate storing the data
    // Add logic to save questionBank to backend/database
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create a Test</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Dropdown */}
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
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name} ({course.difficulty_level})
              </option>
            ))}
          </select>
        </div>

        {/* Questions */}
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="relative bg-gray-50 p-6 rounded-lg shadow-inner mb-4">
            {/* Delete Question Button */}
            <button
              type="button"
              onClick={() => deleteQuestion(questionIndex)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <DeleteIcon className="w-6 h-6" />
            </button>

            <div className="flex justify-between items-center mb-4">
              {/* Question Number */}
              <h2 className="text-lg font-semibold text-gray-700">
                Question {questionIndex + 1}:
              </h2>

              {/* Question Type Dropdown */}
              <select
                value={question.isMultipleChoice ? "radio" : "checkbox"}
                onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="radio">Single Choice</option>
                <option value="checkbox">Multiple Choice</option>
              </select>
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
              <div key={optionIndex} className="flex items-center mb-2 relative">
                {/* Answer Selection */}
                <input
                  type={question.isMultipleChoice ? "radio" : "checkbox"}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />


                {/* Remove Option Button */}
                <button
                  type="button"
                  onClick={() => removeOption(questionIndex, optionIndex)}
                  className="absolute right-0 text-gray-500 hover:text-gray-700"
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