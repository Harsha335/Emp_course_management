// Charts.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Charts: React.FC = () => {
  const data = {
    labels: ['React Basics', 'Node.js for Beginners', 'Advanced JavaScript', 'CSS Flexbox', 'Python for Data Science'],
    datasets: [
      {
        label: 'Time Spent (minutes)',
        data: [30, 25, 33, 20, 40], // Converted seconds to minutes
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Course Engagement Chart',
      },
    },
  };

  return (
    <div className="card p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-2">Course Engagement Chart</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Charts;