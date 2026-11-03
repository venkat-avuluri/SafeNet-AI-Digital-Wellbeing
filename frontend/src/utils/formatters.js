export const CATEGORIES = [
  'Social Media',
  'Entertainment',
  'Education',
  'Productivity',
  'Gaming',
  'Communication',
  'Others'
];

export const TIME_PERIODS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export const formatMinutesToHoursAndMins = (totalMinutes) => {
  if (!totalMinutes || isNaN(totalMinutes) || totalMinutes <= 0) {
    return '0m';
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

export const getCategoryColor = (category) => {
  const map = {
    'Social Media': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', hex: '#f43f5e' },
    'Entertainment': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', hex: '#f59e0b' },
    'Productivity': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', hex: '#10b981' },
    'Education': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', hex: '#3b82f6' },
    'Gaming': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', hex: '#a855f7' },
    'Communication': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', hex: '#06b6d4' },
    'Others': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', hex: '#64748b' }
  };
  return map[category] || map['Others'];
};

export const getRiskTheme = (riskLevel) => {
  switch (riskLevel) {
    case 'High Risk':
      return {
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-800',
        border: 'border-rose-300',
        cardBg: 'bg-rose-50/60',
        hex: '#e11d48',
        label: 'High Risk',
        description: 'Elevated digital dependency patterns detected.'
      };
    case 'Moderate Risk':
      return {
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        border: 'border-amber-300',
        cardBg: 'bg-amber-50/60',
        hex: '#d97706',
        label: 'Moderate Risk',
        description: 'Developing habits warranting proactive boundaries.'
      };
    case 'Low Risk':
    default:
      return {
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
        border: 'border-emerald-300',
        cardBg: 'bg-emerald-50/60',
        hex: '#059669',
        label: 'Low Risk',
        description: 'Healthy and balanced digital lifestyle observed.'
      };
  }
};
