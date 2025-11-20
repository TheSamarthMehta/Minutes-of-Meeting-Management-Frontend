import React from 'react';

const DataTable = ({
  columns,
  data,
  emptyMessage = 'No data found',
  emptyIcon,
  onRowClick,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        {emptyIcon && (
          <div className="mb-4 flex justify-center">
            {emptyIcon}
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  style={{ width: column.width || 'auto' }}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
                className={`${
                  onRowClick 
                    ? 'cursor-pointer hover:bg-teal-50 dark:hover:bg-gray-700/50 transition-colors' 
                    : ''
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    style={{ width: column.width || 'auto' }}
                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
