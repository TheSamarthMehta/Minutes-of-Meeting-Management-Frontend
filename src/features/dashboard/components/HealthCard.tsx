import React from 'react';
import { Award, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface HealthCardProps {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  message: string;
}

const statusConfig = {
  excellent: {
    icon: Award,
    color: 'green',
    bgGradient: 'from-green-50 to-green-100',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-200',
    iconColor: 'text-green-700',
    titleColor: 'text-green-900'
  },
  good: {
    icon: TrendingUp,
    color: 'teal',
    bgGradient: 'from-teal-50 to-teal-100',
    borderColor: 'border-teal-200',
    iconBg: 'bg-teal-200',
    iconColor: 'text-teal-700',
    titleColor: 'text-teal-900'
  },
  fair: {
    icon: TrendingDown,
    color: 'yellow',
    bgGradient: 'from-yellow-50 to-yellow-100',
    borderColor: 'border-yellow-200',
    iconBg: 'bg-yellow-200',
    iconColor: 'text-yellow-700',
    titleColor: 'text-yellow-900'
  },
  poor: {
    icon: AlertTriangle,
    color: 'red',
    bgGradient: 'from-red-50 to-red-100',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-200',
    iconColor: 'text-red-700',
    titleColor: 'text-red-900'
  }
};

export const HealthCard: React.FC<HealthCardProps> = ({ status, score, message }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`bg-gradient-to-br ${config.bgGradient} dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 ${config.borderColor} dark:border-gray-600 p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Overall Health</p>
          <h3 className={`text-2xl font-bold ${config.titleColor} dark:text-white capitalize`}>{status}</h3>
        </div>
        <div className={`w-16 h-16 rounded-full ${config.iconBg} dark:bg-opacity-30 flex items-center justify-center`}>
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
        </div>
      </div>
      
      {/* Score Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
          <span>Activity Score</span>
          <span className="font-semibold">{score.toFixed(0)}/100</span>
        </div>
        <div className="h-3 bg-white/50 dark:bg-gray-600/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
    </div>
  );
};

export default HealthCard;