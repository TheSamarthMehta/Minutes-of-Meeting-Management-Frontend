import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { ActiveStaff } from '../../../api/dashboardService';

interface TopPerformersProps {
  performers: ActiveStaff[];
}

export const TopPerformers: React.FC<TopPerformersProps> = ({ performers }) => {
  if (performers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Performers</h3>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No performance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-teal-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Performers</h3>
      </div>
      
      <div className="space-y-3">
        {performers.map((performer, index) => (
          <div
            key={performer._id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors"
          >
            {/* Rank Badge */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
              index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
              'bg-gray-100 text-gray-600'
            }`}>
              {index + 1}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {performer.staffName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{performer.staffName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{performer.emailAddress}</p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {performer.attendanceRate.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {performer.attendanceCount}/{performer.meetingCount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformers;