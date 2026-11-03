import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const WeeklyTrendLineChart = ({ dailyData = [], goalHours = 4.0 }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No trend records available.
      </div>
    );
  }

  const labels = dailyData.map((d) => d.label || d.date);
  const actualHours = dailyData.map((d) => Number(((d.totalMinutes || 0) / 60).toFixed(2)));
  const goalLine = dailyData.map(() => goalHours);

  const data = {
    labels,
    datasets: [
      {
        label: 'Actual Usage (Hours)',
        data: actualHours,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: `Target Daily Limit (${goalHours}h)`,
        data: goalLine,
        borderColor: '#10b981',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
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
          boxWidth: 12
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
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      y: {
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
      <Line data={data} options={options} />
    </div>
  );
};

export default WeeklyTrendLineChart;
