import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { RecentMeeting } from '../../../api/dashboardService';
import { StatusBadge } from '../../../shared/components/StatusBadge';

interface RecentMeetingsListProps {
  meetings: RecentMeeting[];
  onMeetingClick?: (meeting: RecentMeeting) => void;
}

export const RecentMeetingsList: React.FC<RecentMeetingsListProps> = ({
  meetings,
  onMeetingClick
}) => {
  if (meetings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Meetings</h3>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No meetings yet</h4>
          <p className="text-gray-600 dark:text-gray-400">Schedule your first meeting to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Meetings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your latest scheduled meetings</p>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {meetings.map((meeting) => (
          <div
            key={meeting._id}
            onClick={() => onMeetingClick?.(meeting)}
            className={`p-6 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors ${
              onMeetingClick ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {meeting.meetingTitle}
                </h4>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(meeting.meetingDate).toLocaleDateString()}</span>
                  </div>
                  
                  {meeting.meetingTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{meeting.meetingTime}</span>
                    </div>
                  )}
                  
                  {meeting.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">{meeting.location}</span>
                    </div>
                  )}
                </div>
                
                {meeting.meetingType && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span>{typeof meeting.meetingType === 'object' ? meeting.meetingType.meetingTypeName : meeting.meetingType}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <StatusBadge status={meeting.meetingStatus} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMeetingsList;