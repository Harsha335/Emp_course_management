import 'chartjs-adapter-date-fns';
import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TimeScale,
} from 'chart.js';

// Register the components of Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

type PropsType = {
  data: {
    date: string;
    avgTimeSpent: number;
  }[];
  timeUnit: 'day' | 'month'; // specify the allowed values
  tooltipTitle: string;
  displayXscale: string;
};

const LineChart: React.FC<PropsType> = ({ data, timeUnit, tooltipTitle, displayXscale }) => {
  const chartRef = useRef<any>(null); // Ref to hold the chart instance

  // Prepare the data for the chart
  const chartData = {
    labels: data.map(entry => entry.date), // Extracting dates for x-axis
    datasets: [
      {
        label: 'Average Time Spent',
        data: data.map(entry => entry.avgTimeSpent), // Extracting avgTimeSpent for y-axis
        borderColor: 'rgba(75, 192, 192, 1)', // Line color
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Fill color
        borderWidth: 2,
        fill: true, // Fill area under the line
        tension: 0.3, // Set the tension (curvature) of the line
      },
    ],
  };

  // Define the chart options with correct types
  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // Use valid string literal for position
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeUnit,
          tooltipFormat: tooltipTitle,
          displayFormats: {
            day: displayXscale,
            month: displayXscale,
          },
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  // Cleanup on unmount to avoid canvas errors
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy(); // Destroy chart instance
      }
    };
  }, []);

  return <Line ref={chartRef} data={chartData} options={options} />;
};

export default LineChart;
