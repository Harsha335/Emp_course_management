import React, { useEffect, useState } from 'react';
import axiosTokenInstance from '../../../api_calls/api_token_instance';
import { formatTime } from '../../../helper_functions/time_format';

// TypeScript types for the data
type NotificationType = {
    notification_id: number,
    created_date: Date,
    CourseEnrollment: {
        enroll_id: number,
        emp_id: string,
        current_page: number,
        total_pages: number,
        test_score: number,
        employee: { emp_name: string },
        course: { course_name: string, difficulty_level: string },
    },
    totalTimeSpent: number
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosTokenInstance.get('/api/notifications/admin'); // Adjust API call to your endpoint
        console.log(response)
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications: ', error);
      }
    };

    fetchNotifications();
  }, []);

  // Function to handle status updates (Approve or Reject)
  const handleStatusChange = async (notification: NotificationType, newStatus: boolean) => {
    try {
        const enroll_id = notification.CourseEnrollment.enroll_id;
        const emp_name = notification.CourseEnrollment.employee.emp_name;
        const {course_name, difficulty_level} = notification.CourseEnrollment.course;
        await axiosTokenInstance.post(`/api/notifications/update-status/${enroll_id}`, { emp_name: emp_name, course_name: course_name+" ("+difficulty_level+") ", test_score: notification.CourseEnrollment.test_score, status: newStatus });
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notification) =>
            notification.CourseEnrollment.enroll_id !== enroll_id
            )
        );
    } catch (error) {
      console.error('Error updating status: ', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-800 text-left text-sm uppercase font-semibold">
              <th className="py-3 px-4">Employee Name</th>
              <th className="py-3 px-4">Course Name</th>
              <th className="py-3 px-4">Completion (%)</th>
              <th className="py-3 px-4">Time Spent</th>
              <th className="py-3 px-4">Test Score</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                (
                  <tr key={notification.notification_id} className="border-b border-gray-200">
                    <td className="py-3 px-4">{notification.CourseEnrollment.employee.emp_name}</td>
                    <td className="py-3 px-4">{notification.CourseEnrollment.course.course_name}{" ("}{notification.CourseEnrollment.course.difficulty_level}{") "}</td>
                    <td className="py-3 px-4">
                      {notification.CourseEnrollment.total_pages && notification.CourseEnrollment.current_page
                        ? `${((notification.CourseEnrollment.current_page / notification.CourseEnrollment.total_pages) * 100).toFixed(2)}%`
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4">{formatTime(notification.totalTimeSpent)}</td>
                    <td className="py-3 px-4">{notification.CourseEnrollment.test_score !== null ? notification.CourseEnrollment.test_score : 'N/A'}</td>
                    <td className="py-3 px-4">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                        onClick={() => handleStatusChange(notification, true)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleStatusChange(notification, false)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                )
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4">No notifications found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notifications;