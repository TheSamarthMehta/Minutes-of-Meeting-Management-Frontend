import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ConfigTableHeaderProps {
  label: string;
  sortKey: string;
  currentSortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
}

const ConfigTableHeader: React.FC<ConfigTableHeaderProps> = ({
  label,
  sortKey,
  currentSortBy,
  sortOrder,
  onSort,
  align = 'left'
}) => {
  const isActive = currentSortBy === sortKey;
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <th
      className={`px-6 py-4 ${alignClass} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {label}
        </span>
        {isActive ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="w-4 h-4 text-teal-600" />
          ) : (
            <ArrowDown className="w-4 h-4 text-teal-600" />
          )
        ) : (
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </th>
  );
};

export default ConfigTableHeader;
