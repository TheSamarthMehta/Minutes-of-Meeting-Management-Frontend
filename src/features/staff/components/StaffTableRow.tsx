import React from 'react';
import { Edit2, Trash2, Eye, Mail, Phone, Building2, Briefcase } from 'lucide-react';
import { Staff } from '../../../api/staffService';

interface StaffTableRowProps {
  staff: Staff;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (staff: Staff) => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

const getRoleBadgeColor = (role?: string): string => {
  if (!role) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  
  const roleLower = role.toLowerCase();
  if (roleLower.includes('admin') || roleLower.includes('manager')) {
    return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
  }
  if (roleLower.includes('lead') || roleLower.includes('senior')) {
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
  }
  if (roleLower.includes('developer') || roleLower.includes('engineer')) {
    return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300';
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const StaffTableRow: React.FC<StaffTableRowProps> = ({
  staff,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
      {/* Checkbox */}
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(staff._id)}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
        />
      </td>

      {/* Staff Info */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
            {getInitials(staff.staffName)}
          </div>
          
          {/* Name & Designation */}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {staff.staffName}
            </div>
            {staff.designation && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Briefcase size={12} />
                {staff.designation}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-4">
        {staff.emailAddress ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Mail size={14} className="text-gray-400" />
            <span className="truncate max-w-[200px]" title={staff.emailAddress}>
              {staff.emailAddress}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        )}
      </td>

      {/* Mobile */}
      <td className="px-4 py-4">
        {staff.mobileNo ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Phone size={14} className="text-gray-400" />
            {staff.mobileNo}
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        )}
      </td>

      {/* Department */}
      <td className="px-4 py-4">
        {staff.department ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Building2 size={14} className="text-gray-400" />
            {staff.department}
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        )}
      </td>

      {/* Role */}
      <td className="px-4 py-4">
        {staff.role ? (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(staff.role)}`}>
            {staff.role}
          </span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(staff)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(staff)}
            className="p-2 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 rounded-lg transition-colors duration-150"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(staff)}
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

export default StaffTableRow;
