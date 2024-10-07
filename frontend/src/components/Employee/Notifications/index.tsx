import React, { useEffect, useState } from 'react';
import axiosTokenInstance from '../../../api_calls/api_token_instance';

// TypeScript types for the data
type NotificationType = {
    notification_id: number;
    created_date: Date;
    status: boolean; // Added status
    CourseEnrollment: {
        enroll_id: number;
        emp_id: string;
        course_certificate_url: string; // Added certificate URL
        employee: { emp_name: string };
        course: { course_name: string; difficulty_level: string };
    };
};

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    // Fetch notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axiosTokenInstance.get('/api/notifications/user'); // Adjust API call to your endpoint
                console.log(response);
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications: ', error);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async () => {
      try{
        const data = notifications.map(notification => notification.notification_id);
        const response = await axiosTokenInstance.post('/api/notifications/user/markAsRead', {notification_ids: data});
        setNotifications([]);
        console.log(response);
      }catch(err){
        console.log("Error as markAsRead: ", err);
      }
    }

    return (
        <div className="container mx-auto p-4 relative ">
            <h1 className="text-2xl font-bold mb-6">Notifications</h1>
            <span className='absolute top-2 right-2 px-3 py-2 border border-black rounded-lg shadow-lg hover:bg-slate-100 bg-white cursor-pointer' onClick={markAsRead}>
              Mark all as read
            </span>
            <div className="flex flex-col gap-4">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div key={notification.notification_id} className="border rounded-lg shadow-lg p-4 bg-white hover:shadow-xl transition-shadow duration-300">
                            <div className='flex flex-row justify-between'>
                              <h2 className="text-xl font-semibold mb-2">Hello, {notification.CourseEnrollment.employee.emp_name}!</h2>
                              <p className="text-sm text-gray-600 mb-2">Date: {new Date(notification.created_date).toLocaleDateString()}</p>
                            </div>

                            {notification.status ? (
                                <div className="mt-4">
                                    <p className="text-green-600 text-lg font-medium">Congratulations! 🎉</p>
                                    <p className="text-gray-700">
                                        Your certificate for <strong>{notification.CourseEnrollment.course.course_name}</strong> ({notification.CourseEnrollment.course.difficulty_level}) has been approved!
                                    </p>
                                    <p className="mt-2">
                                        <a href={notification.CourseEnrollment.course_certificate_url} className="text-blue-500 hover:underline">Click here to view your certificate</a>
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <p className="text-red-600 text-lg font-medium">We regret to inform you.</p>
                                    <p className="text-gray-700">Your request for the certificate has been rejected. We encourage you to improve your skills and retake the test.</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4">No notifications found</div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
