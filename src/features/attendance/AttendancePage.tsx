import React, { useState, useEffect } from "react";
import { 
  Users, CheckCircle, XCircle, UserPlus, Trash2, Search, 
  Filter, UserCheck, UserX, AlertCircle, RefreshCw,
  TrendingUp, Clock, Calendar, X, ChevronDown, Save,
  Download, Mail, Phone, Building2, Briefcase, MoreVertical,
  CheckSquare, Square, User, ArrowUpDown, List, Eye
} from "lucide-react";
import { useAttendance } from './hooks/useAttendance';

const AttendancePage = () => {
  const {
    selectedMeeting,
    participants,
    allParticipants,
    meetings,
    availableStaff,
    attendanceStats,
    showAddModal,
    showBulkAddModal,
    selectedStaffIds,
    searchTerm,
    filterStatus,
    sortBy,
    loading,
    initialLoading,
    actionLoading,
    error,
    handleSelectMeeting,
    setShowAddModal,
    setShowBulkAddModal,
    setSelectedStaffIds,
    setSearchTerm,
    setFilterStatus,
    setSortBy,
    handleToggleAttendance,
    handleAddParticipant,
    handleBulkAddParticipants,
    handleRemoveParticipant,
    handleMarkAllPresent,
    handleMarkAllAbsent,
    refreshData,
    clearError,
  } = useAttendance();

  const [tempStaffId, setTempStaffId] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});

  // Auto-save indicator
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        setHasUnsavedChanges(false);
        setPendingChanges({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges]);

  // Handle single add
  const handleSingleAdd = async () => {
    if (!tempStaffId) return;
    try {
      await handleAddParticipant(tempStaffId);
      setTempStaffId("");
      setShowAddModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handle bulk add
  const handleBulkAdd = async () => {
    try {
      await handleBulkAddParticipants();
      setShowBulkAddModal(false);
      setSelectedStaffIds([]);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Toggle staff selection for bulk add
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  // Toggle participant selection
  const toggleParticipantSelection = (participantId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  // Select all participants
  const selectAllParticipants = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map((p: any) => p._id));
    }
  };

  // Bulk actions on selected
  const handleBulkMarkPresent = async () => {
    for (const id of selectedParticipants) {
      const participant = participants.find((p: any) => p._id === id);
      if (participant && !participant.isPresent) {
        await handleToggleAttendance(id);
      }
    }
    setSelectedParticipants([]);
  };

  const handleBulkMarkAbsent = async () => {
    for (const id of selectedParticipants) {
      const participant = participants.find((p: any) => p._id === id);
      if (participant && participant.isPresent) {
        await handleToggleAttendance(id);
      }
    }
    setSelectedParticipants([]);
  };

  const handleBulkRemove = async () => {
    if (window.confirm(`Remove ${selectedParticipants.length} participant(s)?`)) {
      for (const id of selectedParticipants) {
        await handleRemoveParticipant(id);
      }
      setSelectedParticipants([]);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedParticipants([]);
  };

  // Export attendance
  const exportAttendance = () => {
    if (!selectedMeeting || participants.length === 0) return;
    
    const csvData = [
      ['Name', 'Designation', 'Email', 'Mobile', 'Status'],
      ...participants.map((p: any) => [
        p.staffId?.staffName || '',
        p.staffId?.designation || '',
        p.staffId?.emailAddress || '',
        p.staffId?.mobileNo || '',
        p.isPresent ? 'Present' : 'Absent'
      ])
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedMeeting.meetingTitle}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Users className="h-7 w-7 text-white" />
                </div>
                Attendance Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Track and manage meeting attendance with ease</p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Auto-saving...</span>
                </div>
              )}
              {selectedMeeting && (
                <>
                  <button
                    onClick={exportAttendance}
                    disabled={participants.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">Export</span>
                  </button>
                  <button
                    onClick={() => refreshData(selectedMeeting._id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="font-medium hidden sm:inline">Refresh</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        {selectedMeeting && attendanceStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Total Participants</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{attendanceStats.total}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Present</p>
                  <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Absent</p>
                  <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 rounded-xl p-6 text-white hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-teal-100 dark:text-teal-200 font-medium mb-2">Attendance Rate</p>
                  <h3 className="text-3xl font-bold">{attendanceStats.attendancePercentage}%</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Meeting</h2>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
              {meetings.length} meetings
            </span>
          </div>
          
          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No meetings available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {meetings.map((meeting: any) => (
                <div
                  key={meeting._id}
                  onClick={() => handleSelectMeeting(meeting)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedMeeting?._id === meeting._id
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow'
                  }`}
                >
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{meeting.meetingTitle}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {meeting.meetingTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{meeting.meetingTime}</span>
                      </div>
                    )}
                  </div>
                  {selectedMeeting?._id === meeting._id && (
                    <div className="mt-2 pt-2 border-t border-teal-200 dark:border-teal-700">
                      <span className="text-xs text-teal-700 dark:text-teal-300 font-medium">Currently Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Participants Section */}
        {selectedMeeting && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Participants</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMeeting.meetingTitle}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* View Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      <Users className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search participants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present Only</option>
                    <option value="absent">Absent Only</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="status">Sort by Status</option>
                  </select>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="font-medium">Actions</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {showActionsMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                        <button
                          onClick={() => {
                            handleMarkAllPresent();
                            setShowActionsMenu(false);
                          }}
                          disabled={actionLoading === 'mark-all-present'}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors text-left disabled:opacity-50 rounded-t-lg"
                        >
                          <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark All Present</span>
                        </button>
                        <button
                          onClick={() => {
                            handleMarkAllAbsent();
                            setShowActionsMenu(false);
                          }}
                          disabled={actionLoading === 'mark-all-absent'}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left disabled:opacity-50 rounded-b-lg"
                        >
                          <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark All Absent</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Add Buttons */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">Add Member</span>
                  </button>

                  <button
                    onClick={() => setShowBulkAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-sm"
                  >
                    <Users className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">Bulk Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Selection Toolbar */}
            {selectedParticipants.length > 0 && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedParticipants.length} selected
                      </span>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                    >
                      Clear selection
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkMarkPresent}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="font-medium hidden sm:inline">Mark Present</span>
                    </button>
                    <button
                      onClick={handleBulkMarkAbsent}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      <UserX className="h-4 w-4" />
                      <span className="font-medium hidden sm:inline">Mark Absent</span>
                    </button>
                    <button
                      onClick={handleBulkRemove}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="font-medium hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Participants List */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600 dark:border-teal-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading participants...</p>
              </div>
            ) : participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.length === participants.length && participants.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants(participants.map(p => p._id));
                            } else {
                              setSelectedParticipants([]);
                            }
                          }}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {participants.map((participant: any) => (
                      <tr 
                        key={participant._id} 
                        className={`transition-colors ${
                          selectedParticipants.includes(participant._id)
                            ? 'bg-teal-50 dark:bg-teal-900/30'
                            : 'hover:bg-teal-50/50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(participant._id)}
                            onChange={() => toggleParticipantSelection(participant._id)}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-sm">
                              {participant.staffId?.staffName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {participant.staffId?.staffName || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5" />
                            {participant.staffId?.designation || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[200px]">{participant.staffId?.emailAddress || 'N/A'}</span>
                            </div>
                            {participant.staffId?.mobileNo && (
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                                <Phone className="h-3.5 w-3.5" />
                                <span>{participant.staffId?.mobileNo}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleAttendance(participant._id)}
                            disabled={actionLoading === participant._id}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                              participant.isPresent
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                            } disabled:opacity-50`}
                          >
                            {participant.isPresent ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Present
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                Absent
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                // View participant details (can be expanded)
                                alert(`Viewing details for ${participant.staffId?.staffName}`);
                              }}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Remove this participant from the meeting?')) {
                                  handleRemoveParticipant(participant._id);
                                }
                              }}
                              disabled={actionLoading === participant._id}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Remove participant"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No participants yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Add members to this meeting to track attendance</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Add First Member
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Single Member Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Participant</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select a staff member to add to the meeting</p>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Staff Member
                </label>
                <select
                  value={tempStaffId}
                  onChange={(e) => setTempStaffId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={actionLoading === 'add-participant'}
                >
                  <option value="">Select staff member</option>
                  {availableStaff.map((member: any) => (
                    <option key={member._id} value={member._id}>
                      {member.staffName} {member.designation ? `(${member.designation})` : ''}
                    </option>
                  ))}
                </select>
                {availableStaff.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">All staff members have been added to this meeting</p>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setTempStaffId("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors font-medium"
                  disabled={actionLoading === 'add-participant'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSingleAdd}
                  disabled={!tempStaffId || actionLoading === 'add-participant'}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 font-medium"
                >
                  {actionLoading === 'add-participant' ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkAddModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkAddModal(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Add Participants</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select multiple staff members to add ({selectedStaffIds.length} selected)
                </p>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {availableStaff.length > 0 ? (
                  <div className="space-y-2">
                    {availableStaff.map((member: any) => (
                      <label
                        key={member._id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.includes(member._id)}
                          onChange={() => toggleStaffSelection(member._id)}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{member.staffName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.designation || 'No designation'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">All staff members have been added</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkAddModal(false);
                    setSelectedStaffIds([]);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors font-medium"
                  disabled={actionLoading === 'bulk-add'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAdd}
                  disabled={selectedStaffIds.length === 0 || actionLoading === 'bulk-add'}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 font-medium"
                >
                  {actionLoading === 'bulk-add' ? 'Adding...' : `Add ${selectedStaffIds.length} Member(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
