import React from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Filter,
  X,
  Calendar
} from 'lucide-react';

interface MeetingTableHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onAddClick: () => void;
  onExportClick: () => void;
  onBulkDeleteClick?: () => void;
  selectedCount?: number;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  typeFilter: string;
  onTypeFilterChange: (typeId: string) => void;
  meetingTypes: Array<{ _id: string; meetingTypeName: string }>;
  onClearFilters: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' }
];

export const MeetingTableHeader: React.FC<MeetingTableHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onAddClick,
  onExportClick,
  onBulkDeleteClick,
  selectedCount = 0,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  meetingTypes = [],
  onClearFilters
}) => {
  const hasActiveFilters = statusFilter || typeFilter;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Search and Action Buttons Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search meetings by title, description, location..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={onClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Delete (shown when items selected) */}
            {selectedCount > 0 && onBulkDeleteClick && (
              <button
                onClick={onBulkDeleteClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Delete ({selectedCount})</span>
                <span className="sm:hidden">{selectedCount}</span>
              </button>
            )}

            {/* Export */}
            <button
              onClick={onExportClick}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Add Meeting */}
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create Meeting</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
          >
            <option value="">All Types</option>
            {meetingTypes && meetingTypes.map(type => (
              <option key={type._id} value={type._id}>
                {type.meetingTypeName}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={18} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Selection Info */}
      {selectedCount > 0 && (
        <div className="mt-3 flex items-center justify-between p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
          <span className="text-sm text-teal-700 dark:text-teal-300 font-medium">
            {selectedCount} {selectedCount === 1 ? 'meeting' : 'meetings'} selected
          </span>
        </div>
      )}
    </div>
  );
};

export default MeetingTableHeader;
