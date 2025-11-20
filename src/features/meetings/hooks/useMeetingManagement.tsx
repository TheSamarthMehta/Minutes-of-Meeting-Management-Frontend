import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Meeting,
  MeetingFormData,
  MeetingType,
  MeetingStats,
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  bulkDeleteMeetings,
  getAllMeetingTypes,
  sortMeetings,
  filterMeetings,
  filterMeetingsByStatus,
  filterMeetingsByType,
  filterMeetingsByDateRange,
  paginateMeetings,
  calculateMeetingStats,
  validateMeetingData,
  exportMeetingsToCSV,
  downloadCSV
} from '../../../api/meetingService';

// ============================================================================
// Types
// ============================================================================

type SortField = 'title' | 'date' | 'type' | 'status';
type SortOrder = 'asc' | 'desc';

export interface UseMeetingManagementReturn {
  // State
  meetings: Meeting[];
  meetingTypes: MeetingType[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  currentPage: number;
  pageSize: number;
  selectedIds: string[];
  stats: MeetingStats | null;
  statusFilter: string;
  typeFilter: string;
  
  // Computed
  filteredMeetings: Meeting[];
  paginatedMeetings: Meeting[];
  totalPages: number;
  hasSelection: boolean;
  allSelected: boolean;
  
  // Actions - Search & Filter
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  setStatusFilter: (status: string) => void;
  setTypeFilter: (typeId: string) => void;
  clearFilters: () => void;
  
  // Actions - Sort
  setSortBy: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  
  // Actions - Pagination
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Actions - Selection
  toggleSelection: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  
  // Actions - CRUD
  refreshMeetings: () => Promise<void>;
  addMeeting: (data: MeetingFormData) => Promise<Meeting>;
  editMeeting: (id: string, data: MeetingFormData) => Promise<Meeting>;
  removeMeeting: (id: string) => Promise<void>;
  bulkRemoveMeetings: (ids: string[]) => Promise<void>;
  getMeetingDetails: (id: string) => Promise<Meeting>;
  
  // Actions - Import/Export
  exportToCSV: (selectedOnly?: boolean) => void;
  
  // Actions - Validation
  validateForm: (data: MeetingFormData) => string[];
}

// ============================================================================
// Hook
// ============================================================================

export const useMeetingManagement = (): UseMeetingManagementReturn => {
  // State - Data
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MeetingStats | null>(null);
  
  // State - UI Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // ============================================================================
  // Computed Values
  // ============================================================================
  
  const filteredMeetings = useMemo(() => {
    let result = meetings;
    
    // Apply search filter
    if (searchTerm.trim()) {
      result = filterMeetings(result, searchTerm);
    }
    
    // Apply status filter
    if (statusFilter) {
      result = filterMeetingsByStatus(result, statusFilter);
    }
    
    // Apply type filter
    if (typeFilter) {
      result = filterMeetingsByType(result, typeFilter);
    }
    
    // Apply sorting
    result = sortMeetings(result, sortBy, sortOrder);
    
    return result;
  }, [meetings, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(filteredMeetings.length / pageSize);
  }, [filteredMeetings.length, pageSize]);
  
  const paginatedMeetings = useMemo(() => {
    return paginateMeetings(filteredMeetings, currentPage, pageSize);
  }, [filteredMeetings, currentPage, pageSize]);
  
  const hasSelection = useMemo(() => {
    return selectedIds.length > 0;
  }, [selectedIds.length]);
  
  const allSelected = useMemo(() => {
    return paginatedMeetings.length > 0 && 
           paginatedMeetings.every(meeting => selectedIds.includes(meeting._id));
  }, [paginatedMeetings, selectedIds]);
  
  // ============================================================================
  // Effects
  // ============================================================================
  
  // Initial load
  useEffect(() => {
    refreshMeetings();
    loadMeetingTypes();
  }, []);
  
  // Calculate stats when meetings change
  useEffect(() => {
    if (meetings.length > 0) {
      const newStats = calculateMeetingStats(meetings);
      setStats(newStats);
    } else {
      setStats(null);
    }
  }, [meetings]);
  
  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, sortBy, sortOrder, pageSize]);
  
  // ============================================================================
  // Actions - Search & Filter
  // ============================================================================
  
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);
  
  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setTypeFilter('');
    setSearchTerm('');
  }, []);
  
  // ============================================================================
  // Actions - Sort
  // ============================================================================
  
  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);
  
  // ============================================================================
  // Actions - Pagination
  // ============================================================================
  
  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);
  
  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);
  
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);
  
  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);
  
  // ============================================================================
  // Actions - Selection
  // ============================================================================
  
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);
  
  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      // Deselect all on current page
      const pageIds = paginatedMeetings.map(meeting => meeting._id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      // Select all on current page
      const pageIds = paginatedMeetings.map(meeting => meeting._id);
      setSelectedIds(prev => {
        const newIds = [...prev];
        pageIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  }, [allSelected, paginatedMeetings]);
  
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);
  
  // ============================================================================
  // Actions - CRUD
  // ============================================================================
  
  const loadMeetingTypes = useCallback(async () => {
    try {
      const response = await getAllMeetingTypes({ page: 1, limit: 1000 });
      setMeetingTypes(response.data);
    } catch (err: any) {
      console.error('Error loading meeting types:', err);
      // Don't set error here as it's not critical
    }
  }, []);
  
  const refreshMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllMeetings({ page: 1, limit: 1000 }); // Get all meetings
      setMeetings(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const addMeeting = useCallback(async (data: MeetingFormData): Promise<Meeting> => {
    setError(null);
    
    try {
      const newMeeting = await createMeeting(data);
      setMeetings(prev => [...prev, newMeeting]);
      return newMeeting;
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting');
      throw err;
    }
  }, []);
  
  const editMeeting = useCallback(async (id: string, data: MeetingFormData): Promise<Meeting> => {
    setError(null);
    
    try {
      const updatedMeeting = await updateMeeting(id, data);
      setMeetings(prev => prev.map(meeting => 
        meeting._id === id ? updatedMeeting : meeting
      ));
      return updatedMeeting;
    } catch (err: any) {
      setError(err.message || 'Failed to update meeting');
      throw err;
    }
  }, []);
  
  const removeMeeting = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      await deleteMeeting(id);
      setMeetings(prev => prev.filter(meeting => meeting._id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete meeting');
      throw err;
    }
  }, []);
  
  const bulkRemoveMeetings = useCallback(async (ids: string[]): Promise<void> => {
    setError(null);
    
    try {
      await bulkDeleteMeetings(ids);
      setMeetings(prev => prev.filter(meeting => !ids.includes(meeting._id)));
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } catch (err: any) {
      setError(err.message || 'Failed to delete meetings');
      throw err;
    }
  }, []);
  
  const getMeetingDetails = useCallback(async (id: string): Promise<Meeting> => {
    try {
      return await getMeetingById(id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meeting details');
      throw err;
    }
  }, []);
  
  // ============================================================================
  // Actions - Import/Export
  // ============================================================================
  
  const exportToCSV = useCallback((selectedOnly: boolean = false) => {
    const dataToExport = selectedOnly && hasSelection
      ? meetings.filter(meeting => selectedIds.includes(meeting._id))
      : filteredMeetings;
    
    const csvContent = exportMeetingsToCSV(dataToExport);
    const filename = selectedOnly
      ? `meetings_selected_${new Date().toISOString().split('T')[0]}.csv`
      : `meetings_${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(csvContent, filename);
  }, [meetings, filteredMeetings, selectedIds, hasSelection]);
  
  // ============================================================================
  // Actions - Validation
  // ============================================================================
  
  const validateForm = useCallback((data: MeetingFormData): string[] => {
    return validateMeetingData(data);
  }, []);
  
  // ============================================================================
  // Return
  // ============================================================================
  
  return {
    // State
    meetings,
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
    filteredMeetings,
    paginatedMeetings,
    totalPages,
    hasSelection,
    allSelected,
    
    // Actions - Search & Filter
    setSearchTerm,
    clearSearch,
    setStatusFilter,
    setTypeFilter,
    clearFilters,
    
    // Actions - Sort
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    
    // Actions - Pagination
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    
    // Actions - Selection
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    
    // Actions - CRUD
    refreshMeetings,
    addMeeting,
    editMeeting,
    removeMeeting,
    bulkRemoveMeetings,
    getMeetingDetails,
    
    // Actions - Import/Export
    exportToCSV,
    
    // Actions - Validation
    validateForm
  };
};

export default useMeetingManagement;
