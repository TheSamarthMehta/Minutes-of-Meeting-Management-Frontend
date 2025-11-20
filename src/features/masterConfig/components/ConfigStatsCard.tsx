import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ConfigStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
}

const ConfigStatsCard: React.FC<ConfigStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  iconBgColor = 'bg-gradient-to-br from-teal-500 to-cyan-600',
  iconColor = 'text-white'
}) => {
  // Determine color classes based on iconBgColor
  const getColorClasses = () => {
    if (iconBgColor.includes('teal')) {
      return {
        bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
        border: 'border-teal-200 dark:border-teal-800'
      };
    } else if (iconBgColor.includes('blue')) {
      return {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
        border: 'border-blue-200 dark:border-blue-800'
      };
    } else if (iconBgColor.includes('purple') || iconBgColor.includes('pink')) {
      return {
        bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
        border: 'border-purple-200 dark:border-purple-800'
      };
    }
    return {
      bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
      border: 'border-teal-200 dark:border-teal-800'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white break-words leading-tight">
            {value}
          </h3>
          <div className="mt-auto pt-3">
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={subtitle}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`text-xs font-semibold ${
                    trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
              </div>
            )}
          </div>
        </div>
        <div className={`${iconBgColor} p-3 rounded-lg shadow-lg flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default ConfigStatsCard;
