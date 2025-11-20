import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MeetingStatsCardProps {
  icon: 'calendar' | 'clock' | 'check' | 'x';
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'teal' | 'blue' | 'green' | 'orange';
}

const iconMap = {
  calendar: Calendar,
  clock: Clock,
  check: CheckCircle,
  x: XCircle
};

const colorClasses = {
  teal: {
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
    icon: 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800'
  },
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
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    icon: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800'
  }
};

export const MeetingStatsCard: React.FC<MeetingStatsCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  color = 'teal'
}) => {
  const IconComponent = iconMap[icon];
  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${colors.icon} p-3 rounded-lg shadow-lg`}>
          <IconComponent size={24} />
        </div>
      </div>
    </div>
  );
};

export default MeetingStatsCard;
