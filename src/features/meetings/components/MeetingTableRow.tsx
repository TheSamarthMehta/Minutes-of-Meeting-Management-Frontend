import React from 'react';
import { Edit2, Trash2, Eye, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { Meeting, getMeetingTypeName } from '../../../api/meetingService';

interface MeetingTableRowProps {
  meeting: Meeting;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
}

const getStatusBadgeColor = (status?: string): string => {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'InProgress':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'Completed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'Cancelled':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const MeetingTableRow: React.FC<MeetingTableRowProps> = ({
  meeting,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete
}) => {
  const typeName = getMeetingTypeName(meeting.meetingTypeId);
  
  // Get time info for intelligent styling
  const timeInfo = (meeting as any).timeInfo;
  const isInProgress = timeInfo?.status === 'inProgress';
  const isUpcomingSoon = timeInfo?.status === 'upcoming' && timeInfo?.minutesUntilStart <= 60;
  
  // Dynamic row styling based on meeting status
  const getRowClassName = () => {
    let baseClass = "border-b border-gray-200 dark:border-gray-700 transition-colors duration-150";
    
    if (isInProgress) {
      return `${baseClass} bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 border-l-4 border-l-yellow-500`;
    } else if (isUpcomingSoon) {
      return `${baseClass} bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 border-l-4 border-l-blue-500`;
    }
    
    return `${baseClass} hover:bg-gray-50 dark:hover:bg-gray-700/50`;
  };

  return (
    <tr className={getRowClassName()}>
      {/* Checkbox */}
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(meeting._id)}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
        />
      </td>

      {/* Meeting Info */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Calendar size={20} />
          </div>
          
          {/* Title & Description */}
          <div className="min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {meeting.meetingTitle}
            </div>
            {meeting.meetingDescription && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[300px]" title={meeting.meetingDescription}>
                {meeting.meetingDescription}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
          {typeName}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Calendar size={14} className="text-gray-400" />
          {formatDate(meeting.meetingDate)}
        </div>
      </td>

      {/* Time */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Clock size={14} className="text-gray-400" />
          {meeting.meetingTime}
        </div>
      </td>

      {/* Location */}
      <td className="px-4 py-4">
        {meeting.location ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin size={14} className="text-gray-400" />
            <span className="truncate max-w-[150px]" title={meeting.location}>
              {meeting.location}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(meeting.status)}`}>
            {meeting.status || 'Scheduled'}
          </span>
          {(meeting as any).timeInfo && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              {(meeting as any).timeInfo.message}
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(meeting)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(meeting)}
            className="p-2 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-lg transition-colors duration-150"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(meeting)}
            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MeetingTableRow;
