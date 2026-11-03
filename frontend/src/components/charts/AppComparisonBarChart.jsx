import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AppComparisonBarChart = ({ apps = [] }) => {
  if (!apps || apps.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No application usage logged yet.
      </div>
    );
  }

  const top = apps.slice(0, 6);
  const labels = top.map((a) => a.name);
  const hours = top.map((a) => Number((a.minutes / 60).toFixed(2)));

  const data = {
    labels,
    datasets: [
      {
        label: 'Screen Time (Hours)',
        data: hours,
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#ec4899',
          '#f43f5e',
          '#06b6d4',
          '#10b981'
        ],
        borderRadius: 8
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw.toFixed(1)} hours`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Hours', font: { size: 10 } },
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '600' } }
      }
    }
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default AppComparisonBarChart;
