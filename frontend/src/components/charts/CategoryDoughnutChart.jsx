import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getCategoryColor } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryDoughnutChart = ({ categoryBreakdown = {} }) => {
  const entries = Object.entries(categoryBreakdown).filter(([_, mins]) => mins > 0);

  if (entries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No category usage recorded yet.
      </div>
    );
  }

  const labels = entries.map(([cat]) => cat);
  const minutes = entries.map(([_, mins]) => mins);
  const backgroundColors = labels.map((cat) => getCategoryColor(cat).hex);

  const data = {
    labels,
    datasets: [
      {
        data: minutes,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '500' },
          boxWidth: 10,
          padding: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const val = context.raw;
            const pct = Math.round((val / total) * 100);
            const hours = (val / 60).toFixed(1);
            return ` ${context.label}: ${hours}h (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-72 w-full relative flex items-center justify-center">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default CategoryDoughnutChart;
