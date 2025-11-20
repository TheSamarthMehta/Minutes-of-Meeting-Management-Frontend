import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { MeetingType } from '../../../api/masterConfigService';
import { getMeetingTypeInitials } from '../../../api/masterConfigService';

interface ConfigTableRowProps {
  type: MeetingType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (type: MeetingType) => void;
  onEdit: (type: MeetingType) => void;
  onDelete: (type: MeetingType) => void;
}

const ConfigTableRow: React.FC<ConfigTableRowProps> = ({
  type,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete
}) => {
  const initials = getMeetingTypeInitials(type.meetingTypeName);

  return (
    <tr
      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        isSelected ? 'bg-teal-50 dark:bg-teal-900/20' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(type._id)}
          className="w-4 h-4 text-teal-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-teal-500 focus:ring-2"
        />
      </td>

      {/* Meeting Type Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">{initials}</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{type.meetingTypeName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {type.createdAt
                ? `Created ${new Date(type.createdAt).toLocaleDateString()}`
                : 'No date'}
            </div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4">
        {(type as any).category ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200">
            {(type as any).category}
          </span>
        ) : (
          <span className="text-gray-400 italic text-sm">Uncategorized</span>
        )}
      </td>

      {/* Remarks */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
          {type.remarks || <span className="text-gray-400 italic">No remarks</span>}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(type)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(type)}
            className="p-2 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-lg transition-colors duration-150"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(type)}
            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ConfigTableRow;
