import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const Alert = ({ type = 'info', title, message, onClose }) => {
  const styles = {
    info: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-500' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
    danger: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: AlertCircle, iconColor: 'text-rose-500' }
  };

  const current = styles[type] || styles.info;
  const Icon = current.icon;

  return (
    <div className={`rounded-xl border p-4 ${current.bg} ${current.border} ${current.text} flex items-start gap-3 text-sm`}>
      <Icon className={`w-5 h-5 shrink-0 ${current.iconColor} mt-0.5`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        <p className="mt-0.5 text-slate-700 leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
