import React from 'react';
import { X, Mail, Phone, Building2, Briefcase, Calendar, FileText, User } from 'lucide-react';
import { Staff } from '../../../api/staffService';

interface StaffViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

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

export const StaffViewModal: React.FC<StaffViewModalProps> = ({
  isOpen,
  onClose,
  staff
}) => {
  if (!isOpen || !staff) return null;

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Avatar */}
        <div className="relative bg-gradient-to-r from-teal-500 to-cyan-600 p-8 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl">
              {getInitials(staff.staffName)}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{staff.staffName}</h2>
              {staff.designation && (
                <p className="text-teal-100 flex items-center gap-2">
                  <Briefcase size={16} />
                  {staff.designation}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Mail size={20} className="text-teal-600 dark:text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {staff.emailAddress || '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Phone size={20} className="text-teal-600 dark:text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Number</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {staff.mobileNo || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Work Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Building2 size={20} className="text-teal-600 dark:text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {staff.department || '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Briefcase size={20} className="text-teal-600 dark:text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                    <div className="mt-1">
                      {staff.role ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(staff.role)}`}>
                          {staff.role}
                        </span>
                      ) : (
                        <span className="text-gray-900 dark:text-white">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Additional Information
              </h3>
              <div className="space-y-4">
                {staff.remarks && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <FileText size={20} className="text-teal-600 dark:text-teal-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Remarks</p>
                      <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                        {staff.remarks}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Calendar size={20} className="text-teal-600 dark:text-teal-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="text-gray-900 dark:text-white font-medium text-sm">
                        {formatDate(staff.createdAt || staff.created)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Calendar size={20} className="text-teal-600 dark:text-teal-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="text-gray-900 dark:text-white font-medium text-sm">
                        {formatDate(staff.updatedAt || staff.modified)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffViewModal;
