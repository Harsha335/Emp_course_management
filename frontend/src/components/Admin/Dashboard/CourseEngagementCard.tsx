// CourseEngagementCard.tsx
import React from 'react';
import { demoEngagementData } from './demoData';

const CourseEngagementCard: React.FC = () => {
  return (
    <div className="card p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-2">Course Engagement Overview</h2>
      <p>Total Courses Enrolled: {demoEngagementData.totalEnrolled}</p>
      <p>Average Time Spent: {Math.round(demoEngagementData.averageTimeSpent / 60)} minutes</p>
    </div>
  );
};

export default CourseEngagementCard;
