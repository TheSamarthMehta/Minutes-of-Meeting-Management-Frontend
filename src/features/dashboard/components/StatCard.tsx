import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'teal';
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    icon: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
    icon: 'bg-gradient-to-br from-red-500 to-rose-600 text-white',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
    icon: 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    icon: 'bg-gradient-to-br from-purple-500 to-pink-600 text-white',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
    icon: 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'teal',
  onClick
}) => {
  const colors = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white break-words leading-tight mb-1">
            {value}
          </h3>
          <div className="mt-auto pt-2">
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={subtitle}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs font-semibold ${
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
              </div>
            )}
          </div>
        </div>
        <div className={`${colors.icon} p-3 rounded-lg shadow-lg flex-shrink-0`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;