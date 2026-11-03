import React from 'react';
import { getRiskTheme } from '../../utils/formatters';

const RiskBadge = ({ riskLevel, showIcon = true, size = 'md' }) => {
  const theme = getRiskTheme(riskLevel);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${theme.badgeBg} ${theme.badgeText} ${theme.border} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showIcon && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: theme.hex }}
        />
      )}
      {riskLevel || 'Low Risk'}
    </span>
  );
};

export default RiskBadge;
