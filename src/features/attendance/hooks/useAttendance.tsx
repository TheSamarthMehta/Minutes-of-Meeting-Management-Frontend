import { useState, useCallback, useEffect, useMemo } from 'react';
import { attendanceService, AttendanceRecord, AttendanceStats } from '../../../api/attendanceService';
import { api } from '../../../shared/utils/api';
import { handleApiError } from '../../../shared/utils/errorHandler';

interface Meeting {
  _id: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTime?: string;
  meetingStatus: string;
}

interface Staff {
  _id: string;
  staffName: string;
  emailAddress?: string;
  designation?: string;
  mobileNo?: string;
}

export const useAttendance = () => {
  // State management
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<AttendanceRecord[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  
  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /**
   * Fetch meetings and staff data on component mount
   */
  const fetchInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      const [meetingsResponse, staffResponse] = await Promise.all([
        api.get('/meetings?limit=100&sortBy=meetingDate&order=desc'),
        api.get('/staff')
      ]);
      
      setMeetings(meetingsResponse.data || []);
      setStaff(staffResponse.data || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(handleApiError(err) || 'Failed to load data');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  /**
   * Fetch participants and stats for selected meeting
   */
  const fetchMeetingData = useCallback(async (meetingId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [participantsData, statsData] = await Promise.all([
        attendanceService.getMeetingParticipants(meetingId),
        attendanceService.getAttendanceStats(meetingId)
      ]);
      
      setParticipants(participantsData);
      setAttendanceStats(statsData);
    } catch (err) {
      console.error('Error fetching meeting data:', err);
      setError(handleApiError(err) || 'Failed to load meeting data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle meeting selection
   */
  const handleSelectMeeting = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setSearchTerm('');
    setFilterStatus('all');
  }, []);

  /**
   * Toggle attendance for a single participant
   */
  const handleToggleAttendance = useCallback(async (participantId: string) => {
    try {
      setActionLoading(participantId);
      const participant = participants.find(p => p._id === participantId);
      if (!participant) return;

      const updatedParticipant = await attendanceService.toggleAttendance(
        participantId, 
        participant.isPresent
      );
      
      setParticipants(prev =>
        prev.map(p => p._id === participantId ? updatedParticipant : p)
      );

      // Update stats
      if (selectedMeeting) {
        const stats = await attendanceService.getAttendanceStats(selectedMeeting._id);
        setAttendanceStats(stats);
      }
    } catch (err) {
      console.error('Error toggling attendance:', err);
      setError(handleApiError(err) || 'Failed to update attendance');
    } finally {
      setActionLoading(null);
    }
  }, [participants, selectedMeeting]);

  /**
   * Add single participant
   */
  const handleAddParticipant = useCallback(async (staffId: string) => {
    if (!selectedMeeting) return;

    try {
      setActionLoading('add-participant');
      const newParticipant = await attendanceService.addParticipant(
        selectedMeeting._id,
        staffId,
        false
      );
      
      setParticipants(prev => [newParticipant, ...prev]);
      setShowAddModal(false);

      // Update stats
      const stats = await attendanceService.getAttendanceStats(selectedMeeting._id);
      setAttendanceStats(stats);
    } catch (err) {
      console.error('Error adding participant:', err);
      setError(handleApiError(err) || 'Failed to add participant');
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [selectedMeeting]);

  /**
   * Add multiple participants (bulk)
   */
  const handleBulkAddParticipants = useCallback(async () => {
    if (!selectedMeeting || selectedStaffIds.length === 0) return;

    try {
      setActionLoading('bulk-add');
      await attendanceService.addMultipleParticipants(
        selectedMeeting._id,
        selectedStaffIds
      );
      
      // Refresh participants list
      await fetchMeetingData(selectedMeeting._id);
      
      setSelectedStaffIds([]);
      setShowBulkAddModal(false);
    } catch (err) {
      console.error('Error adding participants:', err);
      setError(handleApiError(err) || 'Failed to add participants');
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [selectedMeeting, selectedStaffIds, fetchMeetingData]);

  /**
   * Remove participant
   */
  const handleRemoveParticipant = useCallback(async (participantId: string) => {
    try {
      setActionLoading(participantId);
      await attendanceService.removeParticipant(participantId);
      
      setParticipants(prev => prev.filter(p => p._id !== participantId));

      // Update stats
      if (selectedMeeting) {
        const stats = await attendanceService.getAttendanceStats(selectedMeeting._id);
        setAttendanceStats(stats);
      }
    } catch (err) {
      console.error('Error removing participant:', err);
      setError(handleApiError(err) || 'Failed to remove participant');
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [selectedMeeting]);

  /**
   * Mark all participants as present
   */
  const handleMarkAllPresent = useCallback(async () => {
    if (!selectedMeeting) return;

    try {
      setActionLoading('mark-all-present');
      await attendanceService.markAllPresent(selectedMeeting._id, participants);
      
      // Refresh data
      await fetchMeetingData(selectedMeeting._id);
    } catch (err) {
      console.error('Error marking all present:', err);
      setError(handleApiError(err) || 'Failed to mark all present');
    } finally {
      setActionLoading(null);
    }
  }, [selectedMeeting, participants, fetchMeetingData]);

  /**
   * Mark all participants as absent
   */
  const handleMarkAllAbsent = useCallback(async () => {
    if (!selectedMeeting) return;

    try {
      setActionLoading('mark-all-absent');
      await attendanceService.markAllAbsent(selectedMeeting._id, participants);
      
      // Refresh data
      await fetchMeetingData(selectedMeeting._id);
    } catch (err) {
      console.error('Error marking all absent:', err);
      setError(handleApiError(err) || 'Failed to mark all absent');
    } finally {
      setActionLoading(null);
    }
  }, [selectedMeeting, participants, fetchMeetingData]);

  /**
   * Get filtered and sorted participants
   */
  const filteredParticipants = useMemo(() => {
    let filtered = attendanceService.filterByStatus(participants, filterStatus);
    filtered = attendanceService.searchParticipants(filtered, searchTerm);
    filtered = attendanceService.sortParticipants(filtered, sortBy);
    return filtered;
  }, [participants, filterStatus, searchTerm, sortBy]);

  /**
   * Get available staff (not already added to meeting)
   */
  const availableStaff = useMemo(() => {
    const participantStaffIds = participants.map(p => p.staffId._id);
    return staff.filter(s => !participantStaffIds.includes(s._id));
  }, [staff, participants]);

  // Load initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Load meeting data when meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      fetchMeetingData(selectedMeeting._id);
    } else {
      setParticipants([]);
      setAttendanceStats(null);
    }
  }, [selectedMeeting, fetchMeetingData]);

  return {
    // Data
    selectedMeeting,
    participants: filteredParticipants,
    allParticipants: participants,
    meetings,
    staff,
    availableStaff,
    attendanceStats,
    
    // UI state
    showAddModal,
    showBulkAddModal,
    selectedStaffIds,
    searchTerm,
    filterStatus,
    sortBy,
    
    // Loading states
    loading,
    initialLoading,
    actionLoading,
    error,
    
    // Actions
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
    refreshData: fetchMeetingData,
    clearError: () => setError(null),
  };
};

export default useAttendance;

