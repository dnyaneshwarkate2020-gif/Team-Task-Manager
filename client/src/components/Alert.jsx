import { AlertCircle, CheckCircle, X } from 'lucide-react';

const Alert = ({ type = 'error', message, onClose }) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${styles[type]}`}>
      <Icon size={20} />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-70">
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
