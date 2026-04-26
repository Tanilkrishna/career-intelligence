import React from 'react';
import { Info, AlertTriangle, Loader2 } from 'lucide-react';

const MaintenanceBanner = ({ type = 'info', message }) => {
  if (!message) return null;

  const styles = {
    info: 'bg-indigo-600/20 border-indigo-500/30 text-indigo-200',
    warning: 'bg-orange-600/20 border-orange-500/30 text-orange-200',
    error: 'bg-rose-600/20 border-rose-500/30 text-rose-200'
  };

  const icons = {
    info: <Info size={16} />,
    warning: <Loader2 size={16} className="animate-spin" />,
    error: <AlertTriangle size={16} />
  };

  return (
    <div className={`w-full px-4 py-3 border-b backdrop-blur-md flex items-center justify-center gap-3 animate-in slide-in-from-top duration-500 ${styles[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium tracking-wide">
        {message}
      </span>
    </div>
  );
};

export default MaintenanceBanner;
