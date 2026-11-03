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

const ScreenTimeBarChart = ({ dailyData = [] }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No daily records logged for this period.
      </div>
    );
  }

  const labels = dailyData.map((d) => d.label || d.date);
  const totalHours = dailyData.map((d) => Number(((d.totalMinutes || 0) / 60).toFixed(2)));
  const nightHours = dailyData.map((d) => Number(((d.nightMinutes || 0) / 60).toFixed(2)));

  const data = {
    labels,
    datasets: [
      {
        label: 'Daytime Screen Time (Hours)',
        data: totalHours.map((tot, idx) => Math.max(0, tot - nightHours[idx])),
        backgroundColor: '#6366f1',
        borderRadius: 6,
        stack: 'Stack 0'
      },
      {
        label: 'Night-time Screen Time (Hours)',
        data: nightHours,
        backgroundColor: '#f43f5e',
        borderRadius: 6,
        stack: 'Stack 0'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
          boxWidth: 12,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)} hrs`
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
          font: { size: 11, weight: '600' }
        },
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 } }
      }
    }
  };

  return (
    <div className="h-72 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ScreenTimeBarChart;
