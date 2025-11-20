import React, { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  Settings,
  Filter,
  ChevronLeft,
  ChevronRight,
  Layers,
  X
} from 'lucide-react';
import { useMasterConfig } from './hooks/useMasterConfig';
import { MeetingType } from '../../api/masterConfigService';

// Components
import ConfigStatsCard from './components/ConfigStatsCard';
import ConfigTableHeader from './components/ConfigTableHeader';
import ConfigTableRow from './components/ConfigTableRow';
import ConfigFormModal from './components/ConfigFormModal';
import ConfigViewModal from './components/ConfigViewModal';
import ConfigDeleteModal from './components/ConfigDeleteModal';
import ConfigImportModal from './components/ConfigImportModal';

const MasterConfigPage: React.FC = () => {
  const {
    paginatedTypes,
    filteredTypes,
    stats,
    loading,
    error,
    submitting,
    searchTerm,
    setSearchTerm,
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    fetchMeetingTypes,
    addMeetingType,
    editMeetingType,
    removeMeetingType,
    bulkRemove,
    validateForm,
    exportToCSV,
    importFromCSV,
    clearError
  } = useMasterConfig();

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedType, setSelectedType] = useState<MeetingType | null>(null);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSort = (field: string) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field as any);
    }
  };

  const handleView = (type: MeetingType) => {
    setSelectedType(type);
    setShowViewModal(true);
  };

  const handleEdit = (type: MeetingType) => {
    setSelectedType(type);
    setShowEditModal(true);
  };

  const handleDelete = (type: MeetingType) => {
    setSelectedType(type);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const handleAddSubmit = async (data: any) => {
    const result = await addMeetingType(data);
    if (result) {
      setShowAddModal(false);
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (selectedType) {
      const result = await editMeetingType(selectedType._id, data);
      if (result) {
        setShowEditModal(false);
        setSelectedType(null);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedType) {
      await removeMeetingType(selectedType._id);
      setShowDeleteModal(false);
      setSelectedType(null);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    await bulkRemove(selectedIds);
    setShowBulkDeleteModal(false);
  };

  const handleImport = async (file: File) => {
    const success = await importFromCSV(file);
    if (success) {
      setShowImportModal(false);
    }
    return success;
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Master Configuration</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Manage meeting types and categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ConfigStatsCard
              title="Total Meeting Types"
              value={stats.totalTypes}
              icon={Layers}
              subtitle={`${filteredTypes.length} ${filteredTypes.length === 1 ? 'type' : 'types'} displayed`}
            />
            <ConfigStatsCard
              title="Recently Added"
              value={stats.recentlyAdded}
              icon={Plus}
              subtitle="Added in last 30 days"
              iconBgColor="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <ConfigStatsCard
              title="Active Configurations"
              value={stats.totalTypes}
              icon={Settings}
              subtitle="Available for meetings"
              iconBgColor="bg-gradient-to-br from-purple-500 to-pink-600"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meeting types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Type
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>

              <button
                onClick={exportToCSV}
                className="px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium flex items-center gap-2 transition-colors"
                disabled={filteredTypes.length === 0}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedIds.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Selection Info */}
          {selectedIds.length > 0 && (
            <div className="bg-teal-50 dark:bg-teal-900/20 border-b border-teal-200 dark:border-teal-800 px-6 py-3 flex items-center justify-between">
              <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
              </p>
              <button
                onClick={clearSelection}
                className="text-sm text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-100 font-medium"
              >
                Clear Selection
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        paginatedTypes.length > 0 &&
                        paginatedTypes.every((type) => isSelected(type._id))
                      }
                      onChange={selectAll}
                      className="w-4 h-4 text-teal-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-teal-500 focus:ring-2"
                    />
                  </th>
                  <ConfigTableHeader
                    label="Meeting Type"
                    sortKey="name"
                    currentSortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <ConfigTableHeader
                    label="Category"
                    sortKey="category"
                    currentSortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <ConfigTableHeader
                    label="Remarks"
                    sortKey="remarks"
                    currentSortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        <span className="text-gray-600 dark:text-gray-300">Loading meeting types...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTypes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Layers className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            No Meeting Types Found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {searchTerm
                              ? 'Try adjusting your search criteria'
                              : 'Get started by adding your first meeting type'}
                          </p>
                        </div>
                        {!searchTerm && (
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 font-medium flex items-center gap-2 shadow-sm transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Add Meeting Type
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTypes.map((type) => (
                    <ConfigTableRow
                      key={type._id}
                      type={type}
                      isSelected={isSelected(type._id)}
                      onSelect={toggleSelection}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && paginatedTypes.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, filteredTypes.length)} of{' '}
                  {filteredTypes.length} results
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative z-10">
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-medium shadow-sm hover:border-teal-400 dark:hover:border-gray-500 transition-all cursor-pointer text-sm"
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
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-teal-400 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
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
                        <span className="px-2 text-gray-500">...</span>
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
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-teal-400 dark:hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfigFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSubmit}
        mode="add"
        validateForm={validateForm}
      />

      <ConfigFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedType(null);
        }}
        onSave={handleEditSubmit}
        type={selectedType}
        mode="edit"
        validateForm={validateForm}
      />

      <ConfigViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedType(null);
        }}
        type={selectedType}
      />

      <ConfigDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedType(null);
        }}
        onConfirm={handleDeleteConfirm}
        type={selectedType}
      />

      <ConfigDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        type={null}
        isBulk={true}
        count={selectedIds.length}
      />

      <ConfigImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default MasterConfigPage;
