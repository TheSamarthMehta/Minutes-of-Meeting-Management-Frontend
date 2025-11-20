import React, { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Meeting, MeetingFormData } from '../../api/meetingService';
import { useMeetingManagement } from './hooks/useMeetingManagement';

// Components
import MeetingStatsCard from './components/MeetingStatsCard';
import MeetingTableHeader from './components/MeetingTableHeader';
import MeetingTableRow from './components/MeetingTableRow';
import MeetingFormModal from './components/MeetingFormModal';
import MeetingViewModal from './components/MeetingViewModal';
import MeetingDeleteModal from './components/MeetingDeleteModal';

const MeetingManagerPage: React.FC = () => {
  const {
    // State
    meetingTypes,
    loading,
    error,
    searchTerm,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    selectedIds,
    stats,
    statusFilter,
    typeFilter,
    
    // Computed
    paginatedMeetings,
    totalPages,
    hasSelection,
    allSelected,
    filteredMeetings,
    
    // Actions
    setSearchTerm,
    clearSearch,
    setStatusFilter,
    setTypeFilter,
    clearFilters,
    setSortBy,
    toggleSortOrder,
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    addMeeting,
    editMeeting,
    removeMeeting,
    bulkRemoveMeetings,
    exportToCSV
  } = useMeetingManagement();

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Handlers
  const handleAddClick = () => {
    setSelectedMeeting(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsFormModalOpen(true);
  };

  const handleViewClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsBulkDelete(false);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setIsBulkDelete(true);
    setIsDeleteModalOpen(true);
  };

  const handleSaveMeeting = async (data: MeetingFormData) => {
    if (selectedMeeting) {
      await editMeeting(selectedMeeting._id, data);
    } else {
      await addMeeting(data);
    }
    setIsFormModalOpen(false);
    setSelectedMeeting(null);
  };

  const handleConfirmDelete = async () => {
    if (isBulkDelete) {
      await bulkRemoveMeetings(selectedIds);
      clearSelection();
    } else if (selectedMeeting) {
      await removeMeeting(selectedMeeting._id);
    }
    setIsDeleteModalOpen(false);
    setSelectedMeeting(null);
    setIsBulkDelete(false);
  };

  const handleSort = (field: 'title' | 'date' | 'type' | 'status') => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
    }
  };

  // Calculate stats for display
  const totalMeetings = stats?.totalMeetings || 0;
  const upcomingMeetings = stats?.upcomingMeetings || 0;
  const todayMeetings = stats?.todayMeetings || 0;
  const completedMeetings = stats?.completedMeetings || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Meeting Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your meetings efficiently
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MeetingStatsCard
            icon="calendar"
            title="Total Meetings"
            value={totalMeetings}
            subtitle="All meetings"
            color="teal"
          />
          <MeetingStatsCard
            icon="clock"
            title="Upcoming"
            value={upcomingMeetings}
            subtitle="Scheduled meetings"
            color="blue"
          />
          <MeetingStatsCard
            icon="calendar"
            title="Today"
            value={todayMeetings}
            subtitle="Meetings today"
            color="orange"
          />
          <MeetingStatsCard
            icon="check"
            title="Completed"
            value={completedMeetings}
            subtitle="Finished meetings"
            color="green"
          />
        </div>

        {/* Table Header / Toolbar */}
        <MeetingTableHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={clearSearch}
          onAddClick={handleAddClick}
          onExportClick={() => exportToCSV(hasSelection)}
          onBulkDeleteClick={hasSelection ? handleBulkDeleteClick : undefined}
          selectedCount={selectedIds.length}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          meetingTypes={meetingTypes}
          onClearFilters={clearFilters}
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
          ) : paginatedMeetings.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchTerm || statusFilter || typeFilter ? 'No meetings found matching your criteria' : 'No meetings yet'}
              </p>
              {!searchTerm && !statusFilter && !typeFilter && (
                <button
                  onClick={handleAddClick}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Create Your First Meeting
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
                      <th className="px-4 py-3 text-left min-w-[250px]">
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Meeting
                          {sortBy === 'title' && <ArrowUpDown size={14} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('type')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Type
                          {sortBy === 'type' && <ArrowUpDown size={14} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Date
                          {sortBy === 'date' && <ArrowUpDown size={14} />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Time
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Location
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          Status
                          {sortBy === 'status' && <ArrowUpDown size={14} />}
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
                    {paginatedMeetings.map((meeting) => (
                      <MeetingTableRow
                        key={meeting._id}
                        meeting={meeting}
                        isSelected={selectedIds.includes(meeting._id)}
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredMeetings.length)} of {filteredMeetings.length} meetings
                  </span>
                </div>

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
      <MeetingFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedMeeting(null);
        }}
        onSave={handleSaveMeeting}
        meeting={selectedMeeting}
        meetingTypes={meetingTypes}
        title={selectedMeeting ? 'Edit Meeting' : 'Create New Meeting'}
      />

      <MeetingViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMeeting(null);
        }}
        meeting={selectedMeeting}
      />

      <MeetingDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMeeting(null);
          setIsBulkDelete(false);
        }}
        onConfirm={handleConfirmDelete}
        meeting={selectedMeeting}
        isBulk={isBulkDelete}
        count={selectedIds.length}
      />
    </div>
  );
};

export default MeetingManagerPage;
