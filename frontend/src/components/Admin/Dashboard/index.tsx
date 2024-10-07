// Dashboard.tsx
import React from 'react';
import CourseEngagementCard from './CourseEngagementCard';
import TopCourses from './TopCourses';
import TrendingLearningPaths from './TrendingLearningPaths';
import Charts from './Charts';
import './index.css'

const AdminDashboard: React.FC = () => {
  return (
    <div className="dashboard-container p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CourseEngagementCard />
        <TopCourses />
        <TrendingLearningPaths />
        <Charts />
      </div>
    </div>
  );
};

export default AdminDashboard;
