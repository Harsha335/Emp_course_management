import React, { useState } from 'react';
import axiosTokenInstance from '../../../api_calls/api_token_instance';

const AddCourse = () => {
  const [tagInput, setTagInput] = useState<string>(''); // To handle the input for new tag

  type formType = {
    course_name: string;
    duration: string;
    difficulty_level: string;
    course_img: File | null;
    course_file: File | null;
    description: string;
    tags: string[];  // Change to array of strings
  };

  const [formData, setFormData] = useState<formType>({
    course_name: '',
    duration: '',
    difficulty_level: 'BASIC',
    course_img: null,
    course_file: null,
    description: '',
    tags: [],
  });

  // Handle image upload and preview
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      // console.log(event.target.files[0])
      setFormData({ ...formData, course_img: event.target.files[0] });
      // const reader = new FileReader();
      // reader.onload = (e) => {
      //   if (e.target?.result) {
      //     console.log(e.target.result)
      //     // setFormData({ ...formData, course_img: e.target.result as string });
      //   }
      // };
      // reader.readAsDataURL(event.target.files[0]);
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData((prev) => ({
          ...prev,
          course_file: event.target.files[0], // Save the selected course file
      }));
    }
};

  // Handle text input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add new tag
  const addTag = () => {
    if (tagInput.trim() !== '') {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput(''); // Clear the input after adding
    }
  };

  // Remove tag by index
  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const handleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    try{
      const formDataToSend = new FormData();
      // Append the rest of the form data
      formDataToSend.append('course_name', formData.course_name);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('difficulty_level', formData.difficulty_level);
      formDataToSend.append('description', formData.description);
      // Append the tags array as JSON
      formData.tags.forEach(item => formDataToSend.append("tags[]", item));
      // Append the image file directly
      if (formData.course_img) {
        formDataToSend.append('course_img', formData.course_img); // course_img is of type File
      }
      // Append the course file directly
      if (formData.course_file) {
        formDataToSend.append('course_file', formData.course_file); // course_file is of type File
      }
      console.log(formDataToSend.get('course_img'));
      await axiosTokenInstance.post('/api/courses/addCourse', formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        }});
      setFormData({
        course_name: '',
        duration: '',
        difficulty_level: 'BASIC',
        course_img: null,
        course_file: null,
        description: '',
        tags: [],
      });
    }catch(err){
        console.log("Error at submiting course: ", err)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
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

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Upload Course Image</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* PDF upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Upload Course File (PDF)</label>
            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>

          {/* Tags Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="p-2 border border-gray-300 rounded-md flex-grow"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <button
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                onClick={addTag}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-blue-100 text-blue-700 rounded-md px-3 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => removeTag(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600" onClick={e => handleSubmitForm(e)}>
              Save
            </button>
          </div>
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
