import React from 'react';
import { BarChart3 } from 'lucide-react';
import { MeetingTypeUsage } from '../../../api/dashboardService';

interface MeetingTypeChartProps {
  data: MeetingTypeUsage[];
}

export const MeetingTypeChart: React.FC<MeetingTypeChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Meeting Types</h3>
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No meeting type data available</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const colors = [
    'bg-teal-500',
    'bg-cyan-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-teal-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Meeting Types Distribution</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item._id}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-900 dark:text-white">{item.meetingTypeName}</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{item.count}</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Meetings</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MeetingTypeChart;