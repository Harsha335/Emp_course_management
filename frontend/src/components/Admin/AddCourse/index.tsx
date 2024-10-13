import React, { useState, useEffect } from 'react';
import axiosTokenInstance from '../../../api_calls/api_token_instance';

type formType = {
  course_name: string;
  duration: string;
  difficulty_level: string;
  course_img: File | null;
  course_file: File | null;
  description: string;
  learning_path_ids: number[] ; // ID of the selected learning path
};

const AddCourse = () => {
  const [allLearningPaths, setAllLearningPaths] = useState<{ learning_path_id: number; path_name: string }[]>([]); // all learningPath data
  const [newLearningPath, setNewLearningPath] = useState<{ path_name: string; description: string }>({ // for creating new learning path data
    path_name: '',
    description: '',
  });
  const [addedLearningPaths, setAddedLearningPaths] = useState<{ learning_path_id: number; path_name: string }[]>([]);  // for storing selected learning path data
  const [selectedLearningPath, setSelectedLearningPath] = useState<string | 'new'>(''); // current selected value ('', otherLearningPath_id ,new)
  const [allCourses, setAllCourses] = useState<{ course_id: number; course_name: string; difficulty_level: string }[]>([]);
  const [prerequisites, setPrerequisites] = useState<{ course_id: number; course_name: string; difficulty_level: string }[]>([]);


  const [formData, setFormData] = useState<formType>({
    course_name: '',
    duration: '',
    difficulty_level: 'BASIC',
    course_img: null,
    course_file: null,
    description: '',
    learning_path_ids: [],
  });

  // Fetch learning paths from the database
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const response = await axiosTokenInstance.get('/api/courses/learningPaths');
        setAllLearningPaths(response.data.learning_paths);
      } catch (err) {
        console.error('Error fetching learning paths:', err);
      }
    };

    fetchLearningPaths();
  }, []);

  // fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosTokenInstance.get('/api/courses/allCourses');
        setAllCourses(response.data.courses);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
  
    fetchCourses();
  }, []);
  const handlePrerequisiteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourseId = parseInt(event.target.value);
    if (selectedCourseId) {
      const selectedCourse = allCourses.find((course) => course.course_id === selectedCourseId);
      if (selectedCourse && !prerequisites.find((course) => course.course_id === selectedCourseId)) {
        setPrerequisites((prev) => [...prev, selectedCourse]);
      }
    }
  };
  
  const handleRemovePrerequisite = (course_id: number) => {
    setPrerequisites((prev) => prev.filter((course) => course.course_id !== course_id));
  };
  
  

  // Handle image and file changes
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData({ ...formData, course_img: event.target.files[0] });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData((prev) => ({ ...prev, course_file: event.target.files ? event.target.files[0] : null}));
    }
  };

  // Handle text input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Learning Path selection
  const handleLearningPathChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setSelectedLearningPath(value);
    if (value !== 'new' && value !== '') {
      setFormData(prev => ({ ...formData, learning_path_ids: [...prev.learning_path_ids,parseInt(value)] }));
      const path_name = allLearningPaths.find(path => path.learning_path_id === parseInt(value))?.path_name;
      setAddedLearningPaths((prev) => [...prev, {learning_path_id: parseInt(value), path_name: path_name ? path_name : ''}]);
    }
  };

  // Handle new learning path input change
  const handleNewLearningPathChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewLearningPath((prev) => ({ ...prev, [name]: value }));
  };
  // Function to remove a learning path from addedLearningPaths
  const handleRemoveLearningPath = (learning_path_id: number) => {
    setAddedLearningPaths((prev) => prev.filter((learning_path) => learning_path.learning_path_id !== learning_path_id));
  };


  // Save new learning path
  const handleSaveNewLearningPath = async () => {
    if (newLearningPath.path_name && newLearningPath.description) {
      try {
        // Save new learning path to the server
        const learningPathResponse = await axiosTokenInstance.post('/api/courses/learningPaths/add', newLearningPath);
        const newLearningPathId: number = learningPathResponse.data.learning_path_id;

        // Add new learning path to the addedLearningPaths state
        setAddedLearningPaths((prev) => [...prev, {learning_path_id: newLearningPathId, path_name: newLearningPath.path_name}]);
        
        // Reset new learning path inputs
        setNewLearningPath({ path_name: '', description: '' });
        setSelectedLearningPath('');
        // Update learning paths list
        setAllLearningPaths((prev) => ([...prev, { learning_path_id: newLearningPathId, path_name: newLearningPath.path_name }]));
      } catch (err) {
        console.error('Error saving learning path:', err);
      }
    }
  };

  const handleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('course_name', formData.course_name);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('difficulty_level', formData.difficulty_level);
      formDataToSend.append('description', formData.description);
      formData.learning_path_ids.forEach(item => formDataToSend.append("learning_path_ids[]", item.toString()));
      // formDataToSend.append('learning_path_ids[]', formData.learning_path_ids?.toString() || '');
      prerequisites.forEach(course => formDataToSend.append('prerequisites[]', course.course_id.toString()));
      // Append image and file
      if (formData.course_img) {
        formDataToSend.append('course_img', formData.course_img);
      }
      if (formData.course_file) {
        formDataToSend.append('course_file', formData.course_file);
      }

      // Submit course form
      await axiosTokenInstance.post('/api/courses/addCourse', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Reset form
      setFormData({
        course_name: '',
        duration: '',
        difficulty_level: 'BASIC',
        course_img: null,
        course_file: null,
        description: '',
        learning_path_ids: [],
      });
      setSelectedLearningPath('');
      setNewLearningPath({ path_name: '', description: '' });
      setAddedLearningPaths([]);

    } catch (err) {
      console.error('Error submitting course:', err);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col md:flex-row w-3/4 border-2 border-gray-300 rounded-lg p-8 gap-6 bg-white shadow-lg">
        {/* Left side: Form */}
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-4">Add Course</h2>
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="course_name"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Course Title"
              value={formData.course_name}
              onChange={handleInputChange}
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Course Description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Duration Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <input
              type="text"
              name="duration"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 6 weeks"
              value={formData.duration}
              onChange={handleInputChange}
            />
          </div>

          {/* Difficulty Level Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
            <select
              name="difficulty_level"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              value={formData.difficulty_level}
              onChange={handleInputChange}
            >
              <option value="BASIC">Basic</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          {/* Learning Path Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select Learning Path</label>
            <select
              value={selectedLearningPath}
              onChange={handleLearningPathChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select Learning Path --</option>
              {allLearningPaths.map((path) => (
                <option key={path.learning_path_id} value={path.learning_path_id}>
                  {path.path_name}
                </option>
              ))}
              <option value="new">Add New Learning Path</option>
            </select>
          </div>

          {/* Show fields to add a new learning path */}
          {selectedLearningPath === 'new' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">New Learning Path Name</label>
              <input
                type="text"
                name="path_name"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="Learning Path Name"
                value={newLearningPath.path_name}
                onChange={handleNewLearningPathChange}
              />
              <label className="block text-sm font-medium text-gray-700 mt-2">Description</label>
              <textarea
                name="description"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="Learning Path Description"
                value={newLearningPath.description}
                onChange={handleNewLearningPathChange}
              />
              <button
                className="mt-2 p-2 bg-blue-600 text-white rounded-md"
                onClick={handleSaveNewLearningPath}
              >
                Save Learning Path
              </button>
            </div>
          )}

        {/* Inside your AddCourse component, update the rendering of added learning paths */}
        <div className="flex flex-wrap gap-4">
            {addedLearningPaths.map((learning_path) => (
              <div
                key={learning_path.learning_path_id}
                className="flex items-center bg-blue-100 text-blue-700 rounded-md px-3 py-1"
              >
                {learning_path.path_name}
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveLearningPath(learning_path.learning_path_id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* --------------------here add prerequisites--------------- */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select Prerequisite Courses</label>
            <select onChange={handlePrerequisiteChange} className="mt-2 block w-full p-2 border border-gray-300 rounded-md">
              <option value="">-- Select Prerequisite Course --</option>
              {allCourses
                .map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name} ({course.difficulty_level})
                  </option>
                ))}
            </select>

            {/* Display selected prerequisites with remove option */}
            <div className="mt-4 flex flex-wrap gap-2">
              {prerequisites.map((course) => (
                <div key={course.course_id} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md flex items-center">
                  {course.course_name} ({course.difficulty_level})
                  <button onClick={() => handleRemovePrerequisite(course.course_id)} className="ml-2 text-red-500 hover:text-red-700">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Upload Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Upload Course File</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Submit Button */}
          <button
            className="mt-4 p-2 bg-green-600 text-white rounded-md"
            onClick={handleSubmitForm}
          >
            Submit Course
          </button>
        </div>

        {/* Right side: Image Preview */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full h-96 md:w-96 bg-gray-200 border border-gray-300 flex items-center justify-center">
            {formData.course_img ? (
              <img
                src={URL.createObjectURL(formData.course_img)}
                alt="Course Preview"
                className="object-cover h-full w-full rounded-md"
              />
            ) : (
              <span className="text-gray-500">Course Image Preview</span>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default AddCourse;