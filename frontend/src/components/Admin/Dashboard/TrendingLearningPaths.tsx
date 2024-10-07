// TrendingLearningPaths.tsx
import React from 'react';
import { demoTrendingLearningPaths } from './demoData';

const TrendingLearningPaths: React.FC = () => {
  return (
    <div className="card p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-2">Trending Learning Paths</h2>
      <ul>
        {demoTrendingLearningPaths.map((path) => (
          <li key={path.learning_path_id} className="mb-1">
            {path.path_name} - Average Time: {Math.round(path.average_time_spent / 60)} minutes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingLearningPaths;
