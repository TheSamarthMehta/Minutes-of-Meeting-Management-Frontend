import React, { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Staff, StaffFormData } from '../../api/staffService';
import { useStaffManagement } from './hooks/useStaffManagement';

// Components
import StaffStatsCard from './components/StaffStatsCard';
import StaffTableHeader from './components/StaffTableHeader';
import StaffTableRow from './components/StaffTableRow';
import StaffFormModal from './components/StaffFormModal';
import StaffViewModal from './components/StaffViewModal';
import StaffDeleteModal from './components/StaffDeleteModal';
import StaffImportModal from './components/StaffImportModal';

export const StaffManagementPage: React.FC = () => {
  const {
    // State
    loading,
    error,
    searchTerm,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    selectedIds,
    stats,
    
    // Computed
    paginatedStaff,
    totalPages,
    hasSelection,
    allSelected,
    filteredStaff,
    
    // Actions
    setSearchTerm,
    clearSearch,
    setSortBy,
    toggleSortOrder,
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    addStaff,
    editStaff,
    removeStaff,
    bulkRemoveStaff,
    exportToCSV,
    importFromCSV
  } = useStaffManagement();

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Handlers
  const handleAddClick = () => {
    setSelectedStaff(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsFormModalOpen(true);
  };

  const handleViewClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsBulkDelete(false);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setIsBulkDelete(true);
    setIsDeleteModalOpen(true);
  };

  const handleSaveStaff = async (data: StaffFormData) => {
    if (selectedStaff) {
      await editStaff(selectedStaff._id, data);
    } else {
      await addStaff(data);
    }
    setIsFormModalOpen(false);
    setSelectedStaff(null);
  };

  const handleConfirmDelete = async () => {
    if (isBulkDelete) {
      await bulkRemoveStaff(selectedIds);
      clearSelection();
    } else if (selectedStaff) {
      await removeStaff(selectedStaff._id);
    }
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
    setIsBulkDelete(false);
  };

  const handleSort = (field: 'name' | 'email' | 'department' | 'role' | 'date') => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
    }
  };

  // Calculate stats for display
  const totalStaff = stats?.totalStaff || 0;
  const recentlyAdded = stats?.recentlyAdded || 0;
  
  // Get unique department count instead of top department name
  const departmentCount = stats?.byDepartment 
    ? Object.keys(stats.byDepartment).length
    : 0;
  
  // Get unique role count instead of top role name
  const roleCount = stats?.byRole
    ? Object.keys(stats.byRole).length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your team members and their information</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaffStatsCard
            icon="users"
            title="Total Staff"
            value={totalStaff}
            subtitle="Active members"
            color="teal"
          />
          <StaffStatsCard
            icon="trending"
            title="Recently Added"
            value={recentlyAdded}
            subtitle="Last 30 days"
            color="blue"
          />
          <StaffStatsCard
            icon="building"
            title="Departments"
            value={departmentCount}
            subtitle="Unique divisions"
            color="purple"
          />
          <StaffStatsCard
            icon="check"
            title="Roles"
            value={roleCount}
            subtitle="Unique positions"
            color="green"
          />
        </div>

        {/* Table Header / Toolbar */}
        <StaffTableHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={clearSearch}
          onAddClick={handleAddClick}
          onExportClick={() => exportToCSV(hasSelection)}
          onImportClick={() => setIsImportModalOpen(true)}
          onBulkDeleteClick={hasSelection ? handleBulkDeleteClick : undefined}
          selectedCount={selectedIds.length}
        />

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : paginatedStaff.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchTerm ? 'No staff members found matching your search' : 'No staff members yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddClick}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Add Your First Staff Member
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Staff Member
                          {sortBy === 'name' && <ArrowUpDown size={14} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('email')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Email
                          {sortBy === 'email' && <ArrowUpDown size={14} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Mobile
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('department')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Department
                          {sortBy === 'department' && <ArrowUpDown size={14} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('role')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Role
                          {sortBy === 'role' && <ArrowUpDown size={14} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedStaff.map((staff) => (
                      <StaffTableRow
                        key={staff._id}
                        staff={staff}
                        isSelected={selectedIds.includes(staff._id)}
                        onSelect={toggleSelection}
                        onView={handleViewClick}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredStaff.length)} of {filteredStaff.length} staff members
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative z-10">
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium shadow-sm hover:border-teal-400 dark:hover:border-gray-500 transition-all cursor-pointer"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-20">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="p-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-teal-400 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Previous page"
                    >
                      <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[2.5rem] px-3 py-2 rounded-xl font-medium transition-all ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-teal-400 dark:hover:border-teal-500'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-teal-400 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Next page"
                    >
                      <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <StaffFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedStaff(null);
        }}
        onSave={handleSaveStaff}
        staff={selectedStaff}
        title={selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
      />

      <StaffViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
      />

      <StaffDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStaff(null);
          setIsBulkDelete(false);
        }}
        onConfirm={handleConfirmDelete}
        staff={selectedStaff}
        isBulk={isBulkDelete}
        count={selectedIds.length}
      />

      <StaffImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importFromCSV}
      />
    </div>
  );
};

export default StaffManagementPage;
