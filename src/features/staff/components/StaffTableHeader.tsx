import React from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Filter,
  X,
  Grid,
  List
} from 'lucide-react';

interface StaffTableHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onAddClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
  onBulkDeleteClick?: () => void;
  selectedCount?: number;
  viewMode?: 'table' | 'card';
  onViewModeChange?: (mode: 'table' | 'card') => void;
}

export const StaffTableHeader: React.FC<StaffTableHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onAddClick,
  onExportClick,
  onImportClick,
  onBulkDeleteClick,
  selectedCount = 0,
  viewMode = 'table',
  onViewModeChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search staff by name, email, mobile, department..."
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
          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-2 rounded ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 shadow text-teal-600 dark:text-teal-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                } transition-all duration-200`}
                title="Table View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => onViewModeChange('card')}
                className={`p-2 rounded ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-gray-600 shadow text-teal-600 dark:text-teal-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                } transition-all duration-200`}
                title="Card View"
              >
                <Grid size={18} />
              </button>
            </div>
          )}

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

          {/* Import */}
          <button
            onClick={onImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Export */}
          <button
            onClick={onExportClick}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Add Staff */}
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Staff</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Selection Info */}
      {selectedCount > 0 && (
        <div className="mt-3 flex items-center justify-between p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
          <span className="text-sm text-teal-700 dark:text-teal-300 font-medium">
            {selectedCount} {selectedCount === 1 ? 'staff member' : 'staff members'} selected
          </span>
        </div>
      )}
    </div>
  );
};

export default StaffTableHeader;
